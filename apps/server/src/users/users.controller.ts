import {
  Controller,
  Get,
  Body,
  Patch,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { User } from 'src/auth/decorator/user.decorator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/rbac/permissions.guard';
import { RequiredPermission } from 'src/auth/rbac/permission.types';
import { PermissionAction } from 'src/auth/rbac/permission.types';
import { RequirePermission } from 'src/auth/rbac/permissions.decorator';
import { UpdateSelfDto } from './dto/update-self.dto';
import type { Request } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([PermissionAction.READ, 'User'])
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return { users };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([PermissionAction.UPDATE, 'UserSelf']) // <-- THE PAYOFF
  @HttpCode(HttpStatus.OK)
  async updateMe(@User() user: any, @Body() dto: UpdateSelfDto) {
    // req.user is the full user object from JwtStrategy
    const updatedUser = await this.usersService.updateSelf(user.id, dto);
    return { user: updatedUser };
  }
}
