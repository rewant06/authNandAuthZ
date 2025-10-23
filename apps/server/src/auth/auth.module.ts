import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AuditModule } from 'src/audit/audit.module';

@Module({
  imports: [UsersModule, AuditModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
