import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpContextInterceptor } from './activity-log/http-context.interceptor';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    AuthModule,
    RedisModule,
    ActivityLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpContextInterceptor,
    },
  ],
})
export class AppModule {}
