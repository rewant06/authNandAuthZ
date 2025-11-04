import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { AuditService } from 'src/audit/audit.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginDto } from './dto/loginUser.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_SECONDS = 1 * 60 * 60;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DeviceInfo {
  ip?: string;
  userAgent?: string;
  deviceName?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 30;
  private readonly REFRESH_TOKEN_HASH_ALGO = 'argon2id';
  private readonly REFRESH_TOKEN_BYTES = 48;

  constructor(
    private usersService: UsersService,
    private redisService: RedisService,
    private auditService: AuditService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateLocalUser(dto: LoginDto) {
    const inputEmail = dto.email.trim().toLowerCase();
    const key = `rl:login:email:${inputEmail}`;
    //check for failed attempts

    const attempts = await this.redisService.client.incr(key);

    if (attempts === 1) {
      await this.redisService.client.expire(key, LOCKOUT_TIME_SECONDS);
    }
    if (attempts >= MAX_ATTEMPTS) {
      this.auditService.log({
        email: inputEmail,
        action: 'AUTH_LOGIN_LOCKED',
        success: false,
        reason: 'Account locked for 1 hour due to too many failed attempts',
        timestamp: new Date(),
      });
      throw new UnauthorizedException(
        'Account locked due to too many failed attempts. Try again in 1 hour.',
      );
    }
    // Implement timing locked time of 15 mins
    // here we can use boolean like isLocked and a timestamp: lockedUntil to manage lock state

    const user =
      await this.usersService.findUserByEmailWithPassword(inputEmail);

    // 1. Get the hash. If user doesn't exist, use a "dummy" hash.
    // This dummy hash should be a real Argon2 hash of a random string.
    // For example, the hash of "dummy-password-for-timing-attack-prevention"
    const hashToCompare =
      user?.hashedPassword ??
      '$argon2id$v=19$m=65536,t=3,p=1$QnUoe8k+GNOWgW/XoA3NRA$s5L1EC88p2F0N0UvAFvPZg/1LhINJz0IuS/aB8LMK+s';

    // 2. Always run the verify function. This is the slow part.
    const isValid = await argon2.verify(hashToCompare, dto.password);

    if (!user || !user.hashedPassword || !isValid) {
      this.auditService.log({
        email: inputEmail,
        action: 'AUTH_LOGIN_FAILED',
        success: false,
        reason: 'Invalid email or password',
        timestamp: new Date(),
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attemps on sucessful login
    await this.redisService.client.del(key);

    this.auditService.log({
      userId: user.id,
      email: inputEmail,
      action: 'AUTH_LOGIN_SUCCESS',
      success: true,
      timestamp: new Date(),
    });

    const { hashedPassword: _, ...safeUser } = user;
    return safeUser;
  }

  private async signAccessToken(user: any): Promise<string> {
    const payload = { sub: user.id };
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';

    try {
      return await this.jwtService.signAsync([payload, { expiresIn }]);
    } catch (error) {
      this.logger.error('Failed signing access token', error);
      throw new InternalServerErrorException('Failed to sign access token');
    }
  }

  private randomToken(bytes: number): string {
    return randomBytes(bytes).toString('hex');
  }

  private async createPersistedRefreshToken(
    userId: string,
    device?: DeviceInfo,
  ) {
    const rawToken = this.randomToken(this.REFRESH_TOKEN_BYTES);
    const tokenHash = await argon2.hash(rawToken);
    const expiresAt = addDays(new Date(), this.REFRESH_TOKEN_EXPIRY_DAYS);

    const created = await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
        device: device?.deviceName ?? device?.userAgent ?? null,
      },
    });

    return { rawToken, created };
  }

  async generateTokensForUser(
    user: any,
    device?: DeviceInfo,
  ): Promise<AuthTokens> {
    try {
      // stores the payload for access token
      const accessToken = await this.signAccessToken(user);

      //creates the refresh token with the expiry

      const { rawToken, created } = await this.createPersistedRefreshToken(
        user.id,
        device,
      );
      const refreshToken = `${created.id}.${rawToken}`;

      this.auditService.log({
        userId: user.id,
        email: user.email,
        action: 'AUTH_LOGIN_SUCCESS',
        success: true,
        timestamp: new Date(),
        meta: { refreshId: created.id, device },
      });

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Failed to generate tokens', error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Failed to generate tokends');
    }
  }

  // ---------------------------------------------------------------------

  private parseRefreshToken(
    token: string,
  ): { tokenId: number; tokenValue: string } | null {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const tokenId = Number(parts[0]);
    const tokenValue = parts[1];
    if (!Number.isFinite(tokenId) || !tokenValue) return null;
    return { tokenId, tokenValue };
  }

  private async acquireLock(key: string, ttlMs = 5000): Promise<boolean> {
    if (!this.redisService) return true;

    try {
      return await this.redisService.acquireLock(key, ttlMs);
    } catch (error) {
      this.logger.error('Redis lock acquistion failed', error);
      return false;
    }
  }

  private async releaseLock(key: string): Promise<void> {
    if (!this.redisService) return;

    try {
      await this.redisService.releaseLock(key);
    } catch (error) {
      this.logger.error('Redis lock release failed', error);
    }
  }

  private async handlePossibleReuse(storedToken: any) {
    this.auditService.log({
      userId: storedToken.userId,
      email: storedToken.user.email,
      action: 'AUTH_REFRESH_REUSED',
      success: false,
      reason: 'Detected reuse of refresh token',
      timestamp: new Date(),
      meta: { tokenId: storedToken.id },
    });

    await this.prisma.refreshToken.updateMany({
      where: {
        userId: storedToken.userId,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async refreshTokens(
    providedToken: string,
    device?: DeviceInfo,
  ): Promise<AuthTokens> {
    if (!providedToken)
      throw new UnauthorizedException('Refresh token missing');

    const parts = this.parseRefreshToken(providedToken);
    if (!parts) throw new UnauthorizedException('Malformed refresh token');

    const { tokenId, tokenValue } = parts;

    // Redis
    const lockKey = `refresh_lock: ${tokenId}`;
    const lockAcquired = this.redisService
      ? await this.acquireLock(lockKey, 5000)
      : true;
    if (!lockAcquired)
      throw new ConflictException(
        'A session refresh is already in progress. Please try again.',
      );

    try {
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: {
          id: tokenId,
        },
      });
      if (!storedToken)
        throw new UnauthorizedException(' Refresh token not found');

      if (storedToken.revokedAt) {
        await this.handlePossibleReuse(storedToken);
        throw new UnauthorizedException('Refresh token revoked');
      }

      if (storedToken.expiresAt < new Date()) {
        await this.prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Refresh token expired');
      }

      const matches = await argon2
        .verify(storedToken.tokenHash, tokenValue)
        .catch(() => false);
      if (!matches) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: storedToken.userId, revokedAt: null },
          data: { revokedAt: new Date(), revoked: true },
        });
        this.auditService.log({
          userId: storedToken.userId,
          action: 'AUTH_REFRESH_REUSE_DETECTED',
          success: false,
          reason: 'Refresh token mismatch - possible theft',
          timestamp: new Date(),
        });
        throw new UnauthorizedException(
          'Invalid refresh token (possible theft',
        );
      }

      const result = await this.prisma.$transaction(async (tx) => {
        const rawToken = this.randomToken(this.REFRESH_TOKEN_BYTES);
        const tokenHash = await argon2.hash(rawToken);

        const expiresAt = addDays(new Date(), this.REFRESH_TOKEN_EXPIRY_DAYS);

        const created = await tx.refreshToken.create({
          data: {
            tokenHash,
            userId: storedToken.userId,
            expiresAt,
            device: device?.deviceName ?? device?.userAgent ?? null,
            createdAt: new Date(),
          },
        });

        await tx.refreshToken.update({
          where: { id: storedToken.id },
          data: {
            revokedAt: new Date(),
            replacedBy: created.id,
            lastUsedAt: new Date(),
          },
        });
        return { created, rawToken };
      });

      const user = await this.prisma.user.findUnique({
        where: { id: storedToken.userId },
      });
      if (!user)
        throw new InternalServerErrorException('User not found during refresh');

      const accessToken = await this.signAccessToken(user);
      const refreshToken = `${result.created.id}.${result.rawToken}`;

      this.auditService.log({
        userId: storedToken.userId,
        email: user.email,
        action: 'AUTH_REFRESH_SUCCESS',
        success: true,
        timestamp: new Date(),
        meta: {
          oldRefresh: storedToken.id,
          newRefresh: result.created.id,
          device,
        },
      });
      return { accessToken, refreshToken };
    } finally {
      if (this.redisService) await this.releaseLock(lockKey);
    }
  }

  //---------------------------------------------------------------------------------

  async revokeRefreshToken(providedToken?: string): Promise<void> {
    if (!providedToken) return;
    const parts = this.parseRefreshToken(providedToken);
    if (!parts) {
      this.logger.warn('Revoke attempt with malformed token.');
      return;
    }

    const { tokenId } = parts;
    await this.prisma.refreshToken.updateMany({
      where: { id: tokenId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    this.auditService.log({
      action: 'AUTH_REFRESH_REVOKE',
      success: true,
      timestamp: new Date(),
      meta: { revokedTokenId: tokenId },
    });
  }

  extractDeviceInfo(req: any): DeviceInfo {
    const userAgent = req.headers?.['user-agent'] ?? null;
    const ip =
      (req.headers &&
        (req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress)) ||
      req.ip ||
      null;
    // Optionally parse user-agent to friendly name (use ua-parser-js or similar in production)
    return { userAgent: String(userAgent ?? ''), ip: String(ip ?? '') };
  }
}
