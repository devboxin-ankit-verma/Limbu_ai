/**
 * User repository — database access only.
 *
 * All queries go through Sequelize UserModel.
 * NO business logic here.
 */

import { QueryTypes } from 'sequelize';
import { UserModel, UserAttributes, UserCreationAttributes } from '../models/UserModel';
import { ProviderModel } from '../models/ProviderModel';
import { Op } from 'sequelize';

interface RawAuthRow {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  password_hash: string;
  role: 'provider' | 'customer' | 'admin';
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
}

/**
 * Converts a raw SQL auth row into a UserModel-like object.
 * Uses only the core columns that have existed since day one.
 */
function rawToModel(row: RawAuthRow): UserModel {
  const m = UserModel.build({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    age: row.age,
    gender: row.gender,
    referredByProviderId: null,
  });
  return m;
}

export class UserRepository {
  async findById(id: number): Promise<UserModel | null> {
    return UserModel.findByPk(id);
  }

  /**
   * Raw SQL auth lookup — only reads the core columns that have always existed.
   * Never fails due to missing optional columns (deleted_at, referred_by_provider_id).
   * Skips soft-deleted users by checking deleted_at when available.
   */
  private async findForAuth(field: 'phone' | 'email', value: string): Promise<UserModel | null> {
    const seq = UserModel.sequelize!;

    // Raw query: only core columns — immune to schema migration state
    const rows = await seq.query<RawAuthRow>(
      `SELECT id, name, phone, email, password_hash, role, age, gender
       FROM \`users\`
       WHERE \`${field}\` = :value
         AND (deleted_at IS NULL OR NOT EXISTS (
               SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
               WHERE TABLE_SCHEMA = DATABASE()
                 AND TABLE_NAME = 'users'
                 AND COLUMN_NAME = 'deleted_at'))
       LIMIT 1`,
      { replacements: { value }, type: QueryTypes.SELECT }
    );

    if (!rows.length) return null;
    return rawToModel(rows[0]);
  }

  /** Finds a user by phone number (used for login). */
  async findByPhone(phone: string): Promise<UserModel | null> {
    return this.findForAuth('phone', phone);
  }

  /** Finds a user by email address (used for login). */
  async findByEmail(email: string): Promise<UserModel | null> {
    return this.findForAuth('email', email);
  }

  /** Checks whether a phone exists, including soft-deleted rows. */
  async phoneExists(phone: string): Promise<boolean> {
    const count = await UserModel.count({ where: { phone }, paranoid: false });
    return count > 0;
  }

  /** Checks whether an email exists, including soft-deleted rows. */
  async emailExists(email: string): Promise<boolean> {
    const count = await UserModel.count({ where: { email }, paranoid: false });
    return count > 0;
  }

  async findAll(
    offset: number = 0,
    limit: number = 50,
    filters?: {
      role?: 'provider' | 'customer' | 'admin';
      query?: string;
      includeDeleted?: boolean;
    }
  ): Promise<UserModel[]> {
    const where: Record<string, unknown> = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.query) {
      Object.assign(where, {
        [Op.or]: [
          { name: { [Op.like]: `%${filters.query}%` } },
          { phone: { [Op.like]: `%${filters.query}%` } },
          { email: { [Op.like]: `%${filters.query}%` } },
        ],
      } as Record<string, unknown>);
    }
    return UserModel.findAll({
      where,
      offset,
      limit,
      paranoid: !filters?.includeDeleted,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: ProviderModel,
          as: 'provider',
          required: false,
          attributes: [
            'id', 'bio', 'photos', 'expertise', 'status', 'walletBalance',
            'registrationFeePaidAt', 'providerCode', 'referredUsersCount',
            'aadhaarUrl', 'passportPhotoUrl', 'identityHidden',
            'createdAt', 'updatedAt',
          ],
        },
      ],
    });
  }

  async count(includeDeleted = false): Promise<number> {
    return UserModel.count({ paranoid: !includeDeleted });
  }

  async create(data: UserCreationAttributes): Promise<UserModel> {
    return UserModel.create(data);
  }

  async update(id: number, data: Partial<UserAttributes>): Promise<UserModel | null> {
    const user = await UserModel.findByPk(id);
    if (!user) return null;
    return user.update(data);
  }

  async softDelete(id: number): Promise<void> {
    await UserModel.destroy({ where: { id } });
  }

  async restore(id: number): Promise<void> {
    await UserModel.restore({ where: { id } });
  }

  async registrationsLastDays(
    days: number
  ): Promise<Array<{ day: string; count: number }>> {
    const [rows] = await UserModel.sequelize!.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM users
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
         AND deleted_at IS NULL
       GROUP BY DATE(created_at)
       ORDER BY day ASC`,
      { replacements: { days } }
    );

    return (rows as Array<{ day: string; count: number }>).map((row) => ({
      day: row.day,
      count: Number(row.count),
    }));
  }
}
