import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

export type AuditLogInput = {
  userId?: string;
  email: string;
  action: AuditAction;
  success: boolean;
  reason?: string;
  ip?: string;
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
          email: input.email,
          action: input.action,
          success: input.success,
          reason: input.reason ?? null,
          ip: input.ip ?? null,
          CreatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Audit write failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
