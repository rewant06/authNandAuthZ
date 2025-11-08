import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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
