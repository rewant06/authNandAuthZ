import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { EmailWorker } from './email.worker';
import { MailModule } from 'src/mail/mail.module';
import { URL } from 'url';

@Module({
  imports: [
    MailModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.getOrThrow<string>('REDIS_URL');
        const parsedUrl = new URL(redisUrl);

        return {
          connection: {
            host: parsedUrl.hostname || '127.0.0.1',
            port: parseInt(parsedUrl.port, 10) || 6379,
            password: parsedUrl.password,
            // BullMQ with ioredis needs this to parse the URL correctly
            // if it's a 'redis://' string
          },
        };
      },
    }),

    BullModule.registerQueue({ name: 'email' }),
  ],
  providers: [EmailWorker],
  exports: [BullModule.registerQueue({ name: 'email' })],
})
export class QueuesModule {}
