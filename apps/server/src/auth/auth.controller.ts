import {
  Controller,
  Post,
  Body,
  Get,
  ValidationPipe,
  UsePipes,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { CreateLocalUserDto } from './dto/createUser.dto';
import { LoginDto } from './dto/loginUser.dto';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { parseDeviceInfo } from './device/device.util';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RequirePermission } from './rbac/permissions.decorator';
import { PermissionsGuard } from './rbac/permissions.guard';
import { PermissionAction } from './rbac/permission.types';

const REFRESH_COOKIE_NAME = 'refresh_token';

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
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    const user = await this.authService.validateLocalUser(dto);

    const device = parseDeviceInfo(req);

    const { accessToken, refreshToken } =
      await this.authService.generateTokensForUser(user, device);

    const cookieSecure = process.env.COOKIE_SECURE === 'true';
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    const sameSite: 'none' | 'lax' | 'strict' = cookieSecure ? 'none' : 'lax';
    const cookieOptions = {
      httpOnly: true,
      secure: cookieSecure,
      sameSite,
      domain: cookieDomain,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days in ms (match REFRESH_TOKEN_EXPIRY_DAYS)
    };

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions);

    return { accessToken, user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookie = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!cookie) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const device = parseDeviceInfo(req);

    // AuthService.refreshTokens should return { accessToken, refreshToken }
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      cookie,
      device,
    );

    // rotate cookie
    const cookieSecure = process.env.COOKIE_SECURE === 'true';
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSecure ? 'none' : 'lax',
      domain: cookieDomain,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookie = req.cookies?.[REFRESH_COOKIE_NAME];
    if (cookie) {
      await this.authService.revokeRefreshToken(cookie);
    }
    // clear cookie
    res.clearCookie(REFRESH_COOKIE_NAME, {
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });
    return;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([PermissionAction.READ, 'UserSelf'])
  @HttpCode(HttpStatus.OK)
  async getMe(@Req() req: Request) {
    return { user: req.user };
  }
}
