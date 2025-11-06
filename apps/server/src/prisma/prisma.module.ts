import { Global, Module, forwardRef } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
@Global()
@Module({
  imports: [forwardRef(() => ActivityLogModule)],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
