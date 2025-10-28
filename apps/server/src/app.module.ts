import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, AuditModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
