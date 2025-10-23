import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateLocalUserDto } from './dto/createUser.dto';
import { LoginDto } from './dto/loginUser.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(@Body() dto: CreateLocalUserDto) {
    try {
      const newUser = await this.usersService.createLocalUser(dto);
      return { newUser };
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException('Registration failed');
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateLocalUser(dto);
    return { user };
  }
}
