import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { GetUser } from 'src/auth/user.decorator';

type AuthenticatedUser = {
  id: string;
  roles: string[];
  name?: string;
};

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Body() dto: CreatePostDto, @GetUser() user: AuthenticatedUser) {
    return this.postsService.create(dto, user);
  }

  @Get()
  findAll(@Query() dto: PaginationQueryDto) {
    return this.postsService.findAllPublic(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMyPost(@Request() req) {
    return { message: 'Authenticated!', user: req.user };
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok', service: 'PostingService' };
  }
}
