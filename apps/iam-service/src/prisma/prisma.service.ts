import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { PrismaClient, ActivityLogActionType } from '@prisma/iam-client';
import { ActivityLogService } from 'src/activity-log/activity-log.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(
    @Inject(forwardRef(() => ActivityLogService))
    private activityLogService: ActivityLogService,
  ) {
    super();

    const self = this;

    const activityLogExtension = this.$extends({
      query: {
        // --- We are explicit: We are *only* extending the 'User' model ---
        user: {
          // --- We are explicit: We are *only* extending 'create' ---
          async create({ args, query }) {
            try {
              // Run the actual operation
              const result = await query(args);

              // Log success asynchronously
              Promise.resolve().then(() =>
                self.activityLogService.createLog(
                  ActivityLogActionType.CREATE, // Use the Enum
                  'SUCCESS',
                  'User',
                  result.id, // This is now 100% type-safe
                  { before: null, after: result },
                ),
              );
              return result;
            } catch (err) {
              // Log failure
              const failureReason =
                err instanceof Error ? err.message : String(err);
              self.logger.error(`Failed Prisma action: User.create`, err.stack);

              Promise.resolve().then(() =>
                self.activityLogService.createLog(
                  ActivityLogActionType.CREATE, // Use the Enum
                  'FAILED',
                  'User',
                  null, // No ID was created
                  { before: null, after: args.data }, // Log what we *tried* to do
                  failureReason,
                ),
              );
              throw err; // Re-throw
            }
          },

          // --- We are explicit: We are *only* extending 'update' ---
          async update({ args, query }) {
            let before: any;
            try {
              // This is 100% type-safe: 'update' args always have 'where'
              before = await self.user.findFirst({ where: args.where });
            } catch (e) {
              self.logger.warn(
                `Failed to get 'before' state for audit log: User.update`,
                e.stack,
              );
            }

            try {
              const result = await query(args);

              // Log success
              Promise.resolve().then(() =>
                self.activityLogService.createLog(
                  ActivityLogActionType.UPDATE, // Use the Enum
                  'SUCCESS',
                  'User',
                  result.id, // This is 100% type-safe
                  { before, after: result },
                ),
              );
              return result;
            } catch (err) {
              // Log failure
              const failureReason =
                err instanceof Error ? err.message : String(err);
              self.logger.error(`Failed Prisma action: User.update`, err.stack);

              Promise.resolve().then(() =>
                self.activityLogService.createLog(
                  ActivityLogActionType.UPDATE, // Use the Enum
                  'FAILED',
                  'User',
                  args.where.id ?? null,
                  { before, after: args.data },
                  failureReason,
                ),
              );
              throw err;
            }
          },

          // --- We are explicit: We are *only* extending 'delete' ---
          async delete({ args, query }) {
            let before: any;
            try {
              // This is 100% type-safe: 'delete' args always have 'where'
              before = await self.user.findFirst({ where: args.where });
            } catch (e) {
              self.logger.warn(
                `Failed to get 'before' state for audit log: User.delete`,
                e.stack,
              );
            }

            try {
              const result = await query(args);

              // Log success
              Promise.resolve().then(() =>
                self.activityLogService.createLog(
                  ActivityLogActionType.DELETE, // Use the Enum
                  'SUCCESS',
                  'User',
                  result.id, // This is 100% type-safe
                  { before, after: null },
                ),
              );
              return result;
            } catch (err) {
              // Log failure
              const failureReason =
                err instanceof Error ? err.message : String(err);
              self.logger.error(`Failed Prisma action: User.delete`, err.stack);

              Promise.resolve().then(() =>
                self.activityLogService.createLog(
                  ActivityLogActionType.DELETE, // Use the Enum
                  'FAILED',
                  'User',
                  args.where?.id ?? null, // This is 100% type-safe
                  { before, after: null },
                  failureReason,
                ),
              );
              throw err;
            }
          },

          // --- We explicitly *ignore* ...Many operations (updateMany, deleteMany) ---
          // --- by not defining them. This prevents the 'BatchPayload' error. ---
        },
      },
    });

    // --- APPLY THE EXTENSION ---
    Object.assign(this, activityLogExtension);
  }

  async onModuleInit() {
    await this.$connect();
    // The deprecated '$use' call is gone.
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
