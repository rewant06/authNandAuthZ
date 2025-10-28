import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import argon2 from 'argon2';
import { CreateLocalUserDto } from './dto/createUser.dto';

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
  constructor(private prisma: PrismaService) {}

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
    //----------- Cheking the user with email is already existing or not ------------------------
    const existingUser = await this.prisma.user.findUnique({
      where: { email: finalEmail },
      select: { id: true },
    });

    if (existingUser) {
      throw new Error(`user with email: ${dto.email} already existes`);
    }

    try {
      const newUser = await this.prisma.$transaction(
        async (tx) => {
          const hashPassword = await argon2.hash(dto.password);
          const newUser = await tx.user.create({
            data: {
              name: finalName,
              email: finalEmail,
              hashedPassword: hashPassword,
              role: 'USER',
            },

            select: {
              id: true,
              name: true,
              email: true,
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
