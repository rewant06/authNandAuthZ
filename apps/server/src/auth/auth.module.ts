import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AuditModule } from 'src/audit/audit.module';
import { loadPrivateKey, loadPublicKey } from 'src/common/keys';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RedisModule } from 'src/redis/redis.module';

const privateKey = loadPrivateKey();
const publicKey = loadPublicKey();

@Module({
  imports: [
    UsersModule,
    RedisModule,
    AuditModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      privateKey,
      publicKey,
      signOptions: { algorithm: 'RS256' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
