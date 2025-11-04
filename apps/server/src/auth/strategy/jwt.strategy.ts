import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { loadPublicKey } from '../../common/keys';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['RS256'],
      secretOrKey: loadPublicKey(),
    });
  }

  async validate(payload: { sub: string }) {
    if (!payload || !payload.sub) {
      return null;
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

    const { hashedPassword, ...safeUser } = user;
    return safeUser;
  }
}
