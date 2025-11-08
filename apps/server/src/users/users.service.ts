import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import argon2 from 'argon2';
import { CreateLocalUserDto } from './dto/createUser.dto';
import { RbacService } from 'src/auth/rbac/rbac.service';
import { UpdateSelfDto } from './dto/update-self.dto';
import { AdminUpdateUserDto } from './dto/admin-update.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserPayload } from 'src/auth/types/user-payload.type';
import { PaginatedResponse } from 'src/common/types/response.type';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private static readonly ARGON2_OPTIONS: argon2.Options & { raw?: false } = {
    type: argon2.argon2id,

    // Amount of memory used by the algorithm in KiB.
    // 2**16 = 65,536 KiB = 64 MiB per hash
    // Production turning: 64-256 MiB is common
    memoryCost: 2 ** 16,

    // Number of iterations.
    // Production turning: 3-5 is common.
    timeCost: 3,

    // Number of parallel threads.
    // Production turning: 1-4 is common.
    parallelism: 1,
  };
  constructor(
    private prisma: PrismaService,
    //(using forwardRef to avoid circular dependency)
    @Inject(forwardRef(() => RbacService)) private rbacService: RbacService,
  ) {}

  // Hashing password with argon2 ---------------------------

  private hashPassword(password: string) {
    return argon2.hash(password, UsersService.ARGON2_OPTIONS);
  }

  async verifyAndMaybeRehash(userId: string, password: string, hash: string) {
    const ok = await argon2.verify(hash, password);
    if (ok && argon2.needsRehash(hash, UsersService.ARGON2_OPTIONS)) {
      try {
        const newHash = await this.hashPassword(password);
        await this.prisma.user.update({
          where: { id: userId },
          data: { hashedPassword: newHash },
        });
      } catch (e) {
        this.logger.warn(
          `Rehash failed for user ${userId}: ${e instanceof Error ? e.message : e}`,
        );
      }
    }
    return ok;
  }

  // --------------------------------------------------------------------------

  async createLocalUser(dto: CreateLocalUserDto) {
    const finalEmail = dto.email.trim().toLowerCase();
    const finalName = dto.name?.trim();

    try {
      const newUser = await this.prisma.$transaction(
        async (tx) => {
          const userRole = await tx.role.findUnique({
            where: { name: 'USER' },
          });
          if (!userRole) {
            throw new InternalServerErrorException(
              'Default USER role not found',
            );
          }

          const hashPassword = await this.hashPassword(dto.password);
          const newUser = await tx.user.create({
            data: {
              name: finalName,
              email: finalEmail,
              hashedPassword: hashPassword,
              roles: {
                connect: { id: userRole.id },
              },
            },

            select: {
              id: true,
              name: true,
              email: true,
              roles: true,
              createdAt: true,
              updatedAt: true,
            },
          });
          return newUser;
        },
        { timeout: 5000 },
      );

      return newUser;
    } catch (err) {
      // Prisma unique violation on concurrent creates -> P2002
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw err;
    }
  }

  async getAllUsers(
    dto: PaginationDto,
  ): Promise<PaginatedResponse<Partial<UserPayload>>> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    this.logger.log(`Fetching all users: Page ${page}, Limit ${limit}`);

    try {
      const [users, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          skip: skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            roles: {
              select: {
                name: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count(),
      ]);
      const totalPages = Math.ceil(total / limit);
      return {
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages,
          lastPage: totalPages === page,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get paginated users', error.stack);
      throw new InternalServerErrorException('Could not retrieve users');
    }
  }

  async findUserByEmailWithPassword(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        email: true,
        hashedPassword: true,

        roles: {
          select: {
            name: true,
          },
        },
      },
    });
    return existingUser;
  }

  async updateSelf(userId: string, dto: UpdateSelfDto) {
    this.logger.log(`Attempting to update profile for user: ${userId}`);
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          name: dto.name?.trim(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          roles: {
            select: {
              name: true,
            },
          },
        },
      });
      await this.rbacService.clearCacheForUser(userId);
      this.logger.log(
        `Successfully updated profile and cleared cache for user: ${userId}`,
      );
      return user;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // "Record to update not found"
        if (err.code === 'P2025') {
          this.logger.warn(`User not found for update: ${userId}`, err.stack);
          // Throw a 404, which is what the client should see.
          throw new NotFoundException('User not found');
        }
      }

      // For all other database or application errors
      this.logger.error(
        `Failed to update profile for user: ${userId}`,
        err.stack,
      );
      throw new InternalServerErrorException('Profile update failed.');
    }
  }

  async updateUserById(userId: string, dto: AdminUpdateUserDto) {
    this.logger.log(`Admin is attempting to update user: ${userId}`);

    try {
      const updatedUser = await this.prisma.$transaction(async (tx) => {
        let roleIds: { id: string }[] | undefined = undefined;

        if (dto.roles) {
          const roles = await tx.role.findMany({
            where: { name: { in: dto.roles } },
            select: { id: true },
          });
          // Validate the all requrested roles actually exist
          if (roles.length !== dto.roles.length) {
            this.logger.warn(
              `Admin update failed: Some roles not found for user ${userId}`,
            );
            throw new NotFoundException('One or more roles not found.');
          }
          roleIds = roles.map((r) => ({ id: r.id }));
        }

        // Now, update the user
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            name: dto.name?.trim(),
            roles: roleIds ? { set: roleIds } : undefined,
          },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            roles: { select: { name: true } },
          },
        });
        return user;
      });
      // CRITICAL: Clear the cache for the user who was just modified
      await this.rbacService.clearCacheForUser(userId);
      this.logger.log(
        `Admin successfully updated user: ${userId}. Cache cleared.`,
      );
      return updatedUser;
    } catch (error) {
      if (error.code === 'p2025') {
        this.logger.warn(
          `Admin update failed: User not found: ${userId}`,
          error.stack,
        );
        throw new NotFoundException('User not found');
      }
    }
  }

  async deleteUserById(userId: string): Promise<void> {
    this.logger.log(`Admin is attempting to delete user: ${userId}`);

    try {
      await this.prisma.user.delete({
        where: { id: userId },
      });

      await this.rbacService.clearCacheForUser(userId);
      this.logger.log(
        `Admin successfully deleted user: ${userId}. Cache cleared`,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record to delete not found
          this.logger.warn(
            `Admin delete failed: User not found: ${userId}`,
            error.stack,
          );
          throw new NotFoundException('User not found');
        }
      }
      this.logger.error(`Admin delete failed for user: ${userId}`, error.stack);
      throw new InternalServerErrorException('User deletion failed.');
    }
  }
}
