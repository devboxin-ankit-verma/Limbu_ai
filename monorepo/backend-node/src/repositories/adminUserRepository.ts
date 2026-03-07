/**
 * Admin user repository - database access for admin users only.
 *
 * Used by AuthService for admin login. No business logic here.
 */

import { PrismaClient } from '@prisma/client';

export interface AdminUserRecord {
  id: number;
  email: string;
  passwordHash: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminUserRepository {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Find admin user by email.
   *
   * @param email - Admin email
   * @returns Admin user or null
   */
  async findByEmail(email: string): Promise<AdminUserRecord | null> {
    const row = await this.db.adminUser.findUnique({
      where: { email: email.trim().toLowerCase() }
    });
    return row;
  }

  /**
   * Find admin user by id.
   *
   * @param id - Admin user id
   * @returns Admin user or null
   */
  async findById(id: number): Promise<AdminUserRecord | null> {
    const row = await this.db.adminUser.findUnique({
      where: { id }
    });
    return row;
  }
}
