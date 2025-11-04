import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { Permission, PermissionAction, Role } from '@prisma/client';

// Cache user permissions for 15 minutes
const CACHE_TTL = 15 * 60;
const CACHE_KEY_PREFIX = 'permissions:';

type UserPermission = {
  action: PermissionAction;
  subject: string;
};

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Gets a user's permissions, from cache if possible.
   * This is the main function our Guard will call.
   */
  public async getPermissionsForUser(
    userId: string,
  ): Promise<UserPermission[]> {
    const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;

    // 1. Try to get from cache
    try {
      const cachedPermissions = await this.redis.get(cacheKey);
      if (cachedPermissions) {
        return JSON.parse(cachedPermissions) as UserPermission[];
      }
    } catch (err) {
      this.logger.error(`Redis GET failed for ${cacheKey}: ${err.message}`);
    }

    // 2. Cache miss: Get from database
    this.logger.log(`Cache miss for user ${userId}. Fetching from DB.`);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    // 3. Flatten the permissions
    // We use a Set to automatically handle duplicates
    const permissionsSet = new Set<string>();
    for (const role of user.roles) {
      for (const perm of role.permissions) {
        permissionsSet.add(
          JSON.stringify({
            action: perm.action,
            subject: perm.subject,
          }),
        );
      }
    }

    const flatPermissions = [...permissionsSet].map(
      (p) => JSON.parse(p) as UserPermission,
    );

    // 4. Store in cache
    try {
      await this.redis.set(
        cacheKey,
        JSON.stringify(flatPermissions),
        CACHE_TTL,
      );
    } catch (err) {
      this.logger.error(`Redis SET failed for ${cacheKey}: ${err.message}`);
    }

    return flatPermissions;
  }

  /**
   * Clears the permission cache for a user.
   * We will call this from an 'AdminService' when a user's roles change.
   */
  public async clearCacheForUser(userId: string) {
    const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;
    await this.redis.del(cacheKey);
  }
}
