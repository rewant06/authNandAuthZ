import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { loadPublicKey } from '../../common/keys';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPayload } from '../types/user-payload.type';
import { RedisService } from 'src/redis/redis.service';
import { HttpContextService } from 'src/activity-log/http-context.service';
import { JwtService } from '@nestjs/jwt';
import { Request } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private httpContext: HttpContextService,
    private jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['RS256'],
      secretOrKey: loadPublicKey(),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: { sub: string },
  ): Promise<UserPayload | null> {
    if (!payload || !payload.sub) {
      return null;
    }

    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req as any);
    if (!token) return null;
    
    const decoded: any = this.jwtService.decode(token);
    if (!decoded?.jti) {
      return null; // No JTI, invalid token
    }

    const isDenied = await this.redis.get(`denylist:jti:${decoded.jti}`);
    if (isDenied) {
      return null; // This token is on the denylist (logged out)
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const { hashedPassword: _, ...safeUser } = user;
    this.httpContext.setActor(safeUser);
    return safeUser;
  }
}
