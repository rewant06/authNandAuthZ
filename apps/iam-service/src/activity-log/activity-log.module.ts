import { Module, Global, forwardRef } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { HttpContextService } from './http-context.service';
import { ActivityLogController } from './activity-log.controller';
import { AuthModule } from 'src/auth/auth.module';

@Global()
@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [ActivityLogService, HttpContextService],
  exports: [HttpContextService, ActivityLogService],
  controllers: [ActivityLogController],
})
export class ActivityLogModule {}
