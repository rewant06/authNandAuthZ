import {
  Controller,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';

import { User } from 'src/auth/decorator/user.decorator';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/rbac/permissions.guard';
import { PermissionAction } from 'src/auth/rbac/permission.types';
import { RequirePermission } from 'src/auth/rbac/permissions.decorator';
import { UpdateSelfDto } from './dto/update-self.dto';
import { AdminUpdateUserDto } from './dto/admin-update.dto';
import type { UserPayload } from 'src/auth/types/user-payload.type';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // USER: Update Self
  @Patch('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([PermissionAction.UPDATE, 'UserSelf']) // <-- THE PAYOFF
  @HttpCode(HttpStatus.OK)
  async updateMe(@User() user: UserPayload, @Body() dto: UpdateSelfDto) {
    // req.user is the full user object from JwtStrategy
    const updatedUser = await this.usersService.updateSelf(user.id, dto);
    return { user: updatedUser };
  }

  // -------------- Admin ----------------------------------

  // ADMIN: Update other user

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([PermissionAction.UPDATE, 'User'])
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @User() actor: UserPayload,
    @Param('id') userId: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateUserById(
      userId,
      actor,
      dto,
    );
    return { user: updatedUser };
  }
  // ADMIN: Delete User
  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([PermissionAction.DELETE, 'User'])
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@User() actor: UserPayload, @Param('id') userId: string) {
    await this.usersService.deleteUserById(userId, actor);
    return;
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission([PermissionAction.READ, 'User'])
  @HttpCode(HttpStatus.OK)
  async getAllUsers(@Query() dto: PaginationDto) {
    return this.usersService.getAllUsers(dto);
  }
}
