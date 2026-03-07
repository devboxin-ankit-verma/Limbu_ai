/**
 * User repository - database access for trading users (traders).
 *
 * All DB operations via Prisma. No business logic.
 */

import { PrismaClient } from '@prisma/client';
import { User, CreateUserData, UpdateUserData } from '../models/User';

export interface ListUsersOptions {
  skip: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ListUsersResult {
  data: User[];
  total: number;
}

export class UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: number): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? this.toUser(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });
    return row ? this.toUser(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.db.user.findUnique({
      where: { username: username.trim() }
    });
    return row ? this.toUser(row) : null;
  }

  async findAll(options: ListUsersOptions): Promise<ListUsersResult> {
    const { skip, limit, search, isActive, sort = 'createdAt', order = 'desc' } = options;
    const where: Record<string, unknown> = {};
    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { email: { contains: term } },
        { username: { contains: term } }
      ];
    }
    const [data, total] = await Promise.all([
      this.db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order }
      }),
      this.db.user.count({ where })
    ]);
    return { data: data.map((row) => this.toUser(row)), total };
  }

  async create(userData: CreateUserData): Promise<User> {
    const row = await this.db.user.create({
      data: {
        email: userData.email.trim().toLowerCase(),
        username: userData.username.trim(),
        passwordHash: userData.passwordHash,
        role: userData.role ?? 'trader',
        isActive: userData.isActive ?? true
      }
    });
    return this.toUser(row);
  }

  async update(id: number, userData: UpdateUserData): Promise<User | null> {
    const updateData: Record<string, unknown> = {};
    if (userData.email !== undefined) updateData.email = userData.email.trim().toLowerCase();
    if (userData.username !== undefined) updateData.username = userData.username.trim();
    if (userData.passwordHash !== undefined) updateData.passwordHash = userData.passwordHash;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.isActive !== undefined) updateData.isActive = userData.isActive;
    try {
      const row = await this.db.user.update({
        where: { id },
        data: updateData
      });
      return this.toUser(row);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }

  private toUser(row: {
    id: number;
    email: string;
    username: string;
    passwordHash: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      passwordHash: row.passwordHash,
      role: row.role,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }
}
