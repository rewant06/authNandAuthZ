import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

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

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  log(input: AuditLogInput) {
    this.eventEmitter.emit('audit.log', input);
  }

  @OnEvent('audit.log', { async: true })
  async handleAuditLogEvent(input: AuditLogInput) {
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
          createdAt: input.timestamp, // Use timestamp from the event
        },
      });
    } catch (error) {
      this.logger.error(
        `Async audit write failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
