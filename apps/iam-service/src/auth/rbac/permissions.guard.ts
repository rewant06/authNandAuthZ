// src/auth/rbac/permissions.guard.ts

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RbacService } from './rbac.service';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { PermissionAction, RequiredPermission } from './permission.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Get permissions required by the @RequirePermission() decorator
    const requiredPermissions = this.reflector.getAllAndOverride<
      RequiredPermission[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      // No permissions required, access granted
      return true;
    }

    // 2. Get the user from the request (attached by JwtStrategy)
    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.id) {
      return false; // No user, access denied
    }

    // 3. Get the user's actual permissions (from cache or DB)
    const userPermissions = await this.rbacService.getPermissionsForUser(
      user.id,
    );

    // 4. Check if the user has ALL required permissions
    return requiredPermissions.every(([reqAction, reqSubject]) => {
      return userPermissions.some((userPerm) => {
        // Check for 'MANAGE' wildcard
        if (
          userPerm.action === PermissionAction.MANAGE &&
          (userPerm.subject === reqSubject || userPerm.subject === 'all')
        ) {
          return true;
        }

        // Check for specific permission
        return (
          userPerm.action === reqAction &&
          (userPerm.subject === reqSubject || userPerm.subject === 'all')
        );
      });
    });
  }
}
