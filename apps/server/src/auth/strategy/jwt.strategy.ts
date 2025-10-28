import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { loadPublicKey } from '../../common/keys';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['RS256'],
      secretOrKey: loadPublicKey(),
    });
  }

  async validate(payload: any) {
    // payload contains token claims
    // optionally check user exists in DB
    const user = await this.authService['prisma'].user.findUnique({ where: { id: String(payload.sub) }});
    if (!user) return null;
    // copy safe user
    const { hashedPassword: _, ...safe } = user;
    return safe;
  }
}
