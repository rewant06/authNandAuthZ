import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { RedisService } from 'src/redis/redis.service';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { HttpContextService } from 'src/activity-log/http-context.service';
import { LoginDto } from './dto/loginUser.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { addDays } from 'date-fns';
import { UserPayload } from './types/user-payload.type';
import { RbacService } from './rbac/rbac.service';
import { ForgotPassword } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { loadPublicKey } from 'src/common/keys';

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
    private activityLogService: ActivityLogService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private httpContext: HttpContextService,
    private rbacService: RbacService,
    @InjectQueue('email') private emailQueue: Queue,
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
      await this.activityLogService.createLog(
        'EXECUTE',
        'FAILED',
        'Authentication', // entity Type
        null,
        { email: inputEmail },
        'Account locked due to too many attempts',
      );
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
      await this.activityLogService.createLog(
        'EXECUTE',
        'FAILED',
        'Authentication', // entity Type
        null,
        { email: inputEmail },
        'Invalid credentials',
      );
      throw new UnauthorizedException('Invalid credentials');
    }
    this.httpContext.setActor(user);

    // Reset failed attemps on sucessful login
    await this.redisService.client.del(key);

    await this.activityLogService.createLog(
      'EXECUTE',
      'SUCCESS',
      'Authentication', // entity Type
      user.id, // entityId
      { email: inputEmail },
    );

    const { hashedPassword: _, ...safeUser } = user;
    return safeUser;
  }

  private async signAccessToken(user: any): Promise<string> {
    const userPermissions = await this.rbacService.getPermissionsForUser(
      user.id,
    );
    const payload = {
      sub: user.id,
      jti: randomBytes(16).toString('hex'),
      roles: user.roles.map((role) => role.name),
      permissions: userPermissions.map(
        (permission) => `${permission.action}:${permission.subject}`,
      ),
    };

    try {
      return await this.jwtService.signAsync(payload);
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

      await this.activityLogService.createLog(
        'EXECUTE',
        'SUCCESS',
        'Token', // entity Type
        created.id, // entityId
        { generatedToken: refreshToken },
      );

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
  ): { tokenId: string; tokenValue: string } | null {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const tokenId = parts[0];
    const tokenValue = parts[1];
    if (!tokenId || !tokenValue) return null;
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
    await this.activityLogService.createLog(
      'EXECUTE',
      'FAILED',
      'Token',
      storedToken.id,
      { userId: storedToken.userId },
      'Detected reuse of refresh token',
    );
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
        await this.activityLogService.createLog(
          'EXECUTE',
          'FAILED',
          'Token',
          storedToken.id,
          { userId: storedToken.userId },
          'Invalid refresh token (possible theft)',
        );

        throw new UnauthorizedException(
          'Invalid refresh token (possible theft)',
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

      await this.activityLogService.createLog(
        'EXECUTE',
        'SUCCESS',
        'Token',
        result.created.id,
        { oldRefresh: storedToken.id, newRefresh: result.created.id },
      );

      return { accessToken, refreshToken };
    } finally {
      if (this.redisService) await this.releaseLock(lockKey);
    }
  }

  //---------------------------------------------------------------------------------

  async logout(
    refreshToken: string | undefined,
    accessToken: string | undefined,
    actor: UserPayload,
  ): Promise<void> {
    await this.activityLogService.createLog(
      'EXECUTE',
      'SUCCESS',
      'Authentication',
      actor.id,
      { action: 'logout_initiated' },
      'User logged out',
    );

    if (refreshToken) {
      const parts = this.parseRefreshToken(refreshToken);
      if (parts) {
        const { tokenId } = parts;
        await this.prisma.refreshToken.updateMany({
          where: { id: tokenId, revokedAt: null },
          data: { revokedAt: new Date() },
        });

        await this.activityLogService.createLog(
          'EXECUTE',
          'SUCCESS',
          'Token',
          tokenId,
          { revokedTokenId: tokenId },
          'User logged out',
        );
      }
    }
    if (accessToken) {
      try {
        const payload = await this.jwtService.decode(accessToken);
        if (payload && payload.jti && payload.exp) {
          const jti = payload.jti;
          const exp = payload.exp;
          const now = Math.floor(Date.now() / 1000);
          const ttl = exp - now;

          if (ttl > 0) {
            await this.redisService.set(`denylist:jti:${jti}`, '1', ttl);
          }
        }
      } catch (e) {
        this.logger.warn(
          'Failed to denylist access token on logout',
          e.message,
        );
      }
    }
  }

  async logRevokeFailure(
    err: any,
    actor: UserPayload,
    token: string | undefined,
  ) {
    const reason = err instanceof Error ? err.message : String(err);
    this.logger.warn(`User ${actor.email} failed to logout: ${reason}`);
    await this.activityLogService.createLog(
      'EXECUTE',
      'FAILED',
      'Token',
      null,
      { attemptedToken: token, actorId: actor.id },
      `Logout/Revoke failed: ${reason}`,
    );
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

  private async _createPasswordResetToken(user: UserPayload): Promise<string> {
    const payload = {
      sub: user.id,
      jti: randomBytes(16).toString('hex'),
      aud: 'password-reset',
    };
    return this.jwtService.signAsync(payload, { expiresIn: '15m' });
  }

  async forgotPassword(dto: ForgotPassword): Promise<void> {
    const email = dto.email.trim().toLowerCase();

    await this.activityLogService.createLog(
      'EXECUTE',
      'SUCCESS',
      'Authentication',
      null,
      {
        email,
        action: 'forgot-password-attemp',
      },
    );

    const user = await this.usersService.findUserByEmailWithPassword(email);

    if (!user) {
      this.logger.log(`Password reset attemp for non-existent email: ${email}`);
      return;
    }

    try {
      const token = await this._createPasswordResetToken(user);
      await this.emailQueue.add('send-password-reset', {
        email: user.email,
        token,
      });

      await this.activityLogService.createLog(
        'EXECUTE',
        'SUCCESS',
        'User',
        user.id,
        {
          email,
          action: 'password-reset-request',
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue password reset job for ${email}`,
        error.stack,
      );
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const { token, password } = dto;
    let payload: { sub: string; jti: string; aud: string; exp: number };

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: loadPublicKey(),
        algorithms: ['RS256'],
        audience: 'password-reset',
      });
    } catch (error) {
      this.logger.warn(
        `Password reset failed: Invalid or expired token provided.`,
      );
      await this.activityLogService.createLog(
        'EXECUTE',
        'FAILED',
        'Authentication',
        null,
        { action: 'password-reset-attemp' },
        `Invalid or expired token: ${error.message}`,
      );
      throw new BadRequestException('Invalid or expired token');
    }

    // Check the DenyList

    const { jti, sub: userId, exp } = payload;
    const isDenied = await this.redisService.get(`denylist:jti:${jti}`);

    if (isDenied) {
      this.logger.warn(`Password reset failed: Token already used: ${jti}`);
      await this.activityLogService.createLog(
        'EXECUTE',
        'FAILED',
        'User',
        userId,
        { action: 'password-reset-attempt', jti },
      );
      throw new BadRequestException('Token has already been used.');
    }

    let user: UserPayload;
    try {
      const hashedPassword = await this.usersService.hashPassword(password);

      user = await this.prisma.user.update({
        where: { id: userId },
        data: { hashedPassword },
        select: {
          id: true,
          name: true,
          email: true,
          roles: {
            select: {
              name: true,
            },
          },
        },
      });
      this.logger.log(`User password reset sucessfully for: ${user.email}`);
    } catch (error) {
      this.logger.log(
        `Failed to update password for user: ${userId}`,
        error.stack,
      );
      await this.activityLogService.createLog(
        'EXECUTE',
        'FAILED',
        'User',
        userId,
        { action: 'password-reset' },
        `Failed to update password in DB: ${error.message}`,
      );
      throw new InternalServerErrorException('Password update failed.');
    }

    const now = Math.floor(Date.now() / 1000);
    const ttl = exp - now;

    if (ttl > 0) {
      await this.redisService.set(`denylist:jti:${jti}`, `1`, ttl);
    }

    await this.activityLogService.createLog(
      'UPDATE',
      'SUCCESS',
      'User',
      userId,
      { action: 'password-reset-success' },
    );
  }
}
