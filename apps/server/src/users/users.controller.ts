import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/rbac/permissions.guard';
import { RequiredPermission } from 'src/auth/rbac/permission.types';
import { PermissionAction } from 'src/auth/rbac/permission.types';
import { RequirePermission } from 'src/auth/rbac/permissions.decorator';

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
}
