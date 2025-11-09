import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Prisma } from '@prisma/posting-client';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

type AuthenticatedUser = {
  id: string;
  roles: string[];
  name?: string;
};

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(private prisma: PrismaService) {}

  private generateRandomName(): string {
    const adjectives = ['Quiet', 'Witty', 'Silent', 'Swift', 'Hidden'];
    const nouns = ['Panda', 'Llama', 'Nightingale', 'Fox', 'Observer'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${
      nouns[Math.floor(Math.random() * nouns.length)]
    }`;
  }

  async create(createPostDto: CreatePostDto, user: AuthenticatedUser) {
    this.logger.log(`User [${user.id}] attempting to create post...`);

    const { content, isAnonymous, authorDisplayName } = createPostDto;

    let finalAuthorName: string | null = null;

    if (isAnonymous) {
      if (authorDisplayName && authorDisplayName.trim().length > 0) {
        finalAuthorName = authorDisplayName.trim();
      } else {
        finalAuthorName = this.generateRandomName();
      }
    } else {
      finalAuthorName = user.name || this.generateRandomName();
    }

    try {
      const post = await this.prisma.post.create({
        data: {
          content: content,
          userId: user.id,
          isAnonymous: isAnonymous,
          authorDisplayName: finalAuthorName,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          isAnonymous: true,
          authorDisplayName: true,
        },
      });

      this.logger.log(
        `Post [${post.id}] created successfully by User [${user.id}]`,
      );

      return post;
    } catch (error) {
      this.logger.error(
        `Failed to create post for User [${user.id}]: ${error.message}`,
        error.stack,
      );

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('This resource already exists.');
        }
      }

      throw new InternalServerErrorException('Failed to create post.');
    }
  }

  async findAllPublic(dto: PaginationQueryDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const offset = (page - 1) * limit;
    this.logger.log(
      `Fetching all public posts... Page: ${page}, Limit: ${limit}`,
    );

    try {
      const [posts, total] = await this.prisma.$transaction([
        this.prisma.post.findMany({
          skip: offset,
          take: limit,
          orderBy: {
            createdAt: 'desc', // Show newest posts first
          },
          // CRITICAL: Select only the fields safe for public view
          select: {
            id: true,
            content: true,
            createdAt: true,
            isAnonymous: true,
            authorDisplayName: true,
          },
        }),
        // Query for the total count
        this.prisma.post.count(),
      ]);

      // 2. Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Found ${total} total posts, returning page ${page} of ${totalPages}`,
      );

      // 3. Return a production-grade paginated response
      return {
        data: posts,
        meta: {
          totalItems: total,
          itemCount: posts.length,
          itemsPerPage: limit,
          totalPages: totalPages,
          currentPage: page,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch public posts: ${error.message}`,
        error.stack,
      );
      // This is a read operation, so most errors will be 500
      throw new InternalServerErrorException('Failed to fetch posts.');
    }
  }
}
