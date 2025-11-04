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
    //INJECT THE RBAC SERVICE (using forwardRef to avoid circular dependency)
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

  async updateSelf(userId: string, dto: UpdateSelfDto) {
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

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUserByEmailWithPassword(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        email: true,
        hashedPassword: true,
      },
    });
    return existingUser;
  }
}
