import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// This is the shape of the payload from Step 1
type JwtPayload = {
  sub: string;
  name: string;
  email: string;
  roles: string[];
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const publicKey = configService.getOrThrow<string>(
      'AUTH_SERVICE_PUBLIC_KEY',
    );
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use the *same* public key
      secretOrKey: publicKey.replace(/\\n/g, '\n'),
      algorithms: ['RS256'],
    });
  }

  // Passport will auto-run this after a successful validation
  async validate(payload: JwtPayload) {
    console.log('Token validated successfully:', payload);
    // We just return the useful parts
    return {
      id: payload.sub,
      name: payload.name,
      roles: payload.roles,
    };
  }
}
