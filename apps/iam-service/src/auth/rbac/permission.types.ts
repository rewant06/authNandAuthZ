export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE',
}

// This is the "subject" from our schema
// 'all' is a special keyword for "any subject"
export type PermissionSubject = string | 'all';

export type RequiredPermission = [PermissionAction, PermissionSubject];
