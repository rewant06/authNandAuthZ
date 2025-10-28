import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

export type AuditLogInput = {
  userId?: string;
  email?: string | null;
  action: AuditAction;
  success: boolean;
  reason?: string | null;
  ip?: string | null;
  device?: string | null;
  meta?: Record<string, any>;
  timestamp: Date;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    try {
      await this.prisma.auditEvent.create({
        data: {
          userId: input.userId ?? null,
          email: input.email ?? null,
          action: input.action,
          success: input.success,
          reason: input.reason ?? null,
          ip: input.ip ?? null,
          device: input.device ?? null,
          meta: input.meta,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Audit write failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
