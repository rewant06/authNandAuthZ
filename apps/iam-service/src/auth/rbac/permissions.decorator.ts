import { SetMetadata } from '@nestjs/common';
import { RequiredPermission } from './permission.types';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermission = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
