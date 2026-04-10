/**
 * Admin seeder script.
 *
 * Creates the initial admin user if one does not already exist.
 * Admin credentials are read from environment variables — never hardcoded.
 *
 * Usage:
 *   npm run seed:admin
 *
 * Required env vars (set in .env or environment):
 *   ADMIN_NAME, ADMIN_PHONE, ADMIN_EMAIL, ADMIN_PASSWORD
 */

import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { Sequelize } from 'sequelize';
import { config } from '../src/config';
import { initModels, UserModel } from '../src/models';

const SALT_ROUNDS = 10;

async function seedAdmin(): Promise<void> {
  const adminName = process.env.ADMIN_NAME;
  const adminPhone = process.env.ADMIN_PHONE;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const missing: string[] = [];
  if (!adminName) missing.push('ADMIN_NAME');
  if (!adminPhone) missing.push('ADMIN_PHONE');
  if (!adminEmail) missing.push('ADMIN_EMAIL');
  if (!adminPassword) missing.push('ADMIN_PASSWORD');

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables for seeder: ${missing.join(', ')}`);
    console.error('   Set them in your .env file and re-run.');
    process.exit(1);
  }

  const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: false,
  });

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    initModels(sequelize);

    // Sync tables so the users table exists before we insert
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced.');

    // Check if an admin already exists
    const existing = await UserModel.findOne({ where: { role: 'admin' } });
    if (existing) {
      console.log(`⚠️  Admin already exists (id=${existing.id}, email=${existing.email}). Skipping seed.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(adminPassword!, SALT_ROUNDS);

    const admin = await UserModel.create({
      name: adminName!,
      phone: adminPhone!,
      email: adminEmail!,
      passwordHash,
      role: 'admin',
    });

    console.log('');
    console.log('🎉 Admin user created successfully!');
    console.log('─────────────────────────────────────');
    console.log(`   ID       : ${admin.id}`);
    console.log(`   Name     : ${admin.name}`);
    console.log(`   Phone    : ${admin.phone}`);
    console.log(`   Email    : ${admin.email}`);
    console.log(`   Password : ${adminPassword}`);
    console.log(`   Role     : ${admin.role}`);
    console.log('─────────────────────────────────────');
    console.log('   Use the email and password above to log in at the admin panel.');
    console.log('');
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
