/**
 * User roles and permissions.
 * 
 * All role-related constants go here.
 */

export class UserRoles {
  static readonly ADMIN = 'admin';
  static readonly USER = 'user';
  static readonly MODERATOR = 'moderator';
}

export class Permissions {
  static readonly READ_USERS = 'read:users';
  static readonly WRITE_USERS = 'write:users';
  static readonly DELETE_USERS = 'delete:users';
  static readonly ADMIN_ACCESS = 'admin:access';
}
