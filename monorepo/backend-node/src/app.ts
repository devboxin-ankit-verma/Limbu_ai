/**
 * Main application entry point.
 *
 * Initializes the database connection, then starts Express.
 */

import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { routes } from './routes';
import { registerRepositories } from './dependencies/register';
import sequelize from './database/connection';
import { Sequelize } from 'sequelize';
import { runMigrations } from './database/migrate';

const app: Express = express();

// Register all services/repositories
registerRepositories(app);

// Middleware
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir)));

// Routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', version: config.appVersion });
});

// Error handling (must be last)
app.use(errorHandler);

/**
 * Ensures the default admin account exists.
 * Uses raw SQL so it never fails due to missing optional columns.
 */
async function seedAdmin(seq: Sequelize): Promise<void> {
  try {
    const adminEmail   = process.env.ADMIN_EMAIL    || 'admin@daimassage.com';
    const adminPhone   = process.env.ADMIN_PHONE    || '9000000000';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    // Use raw SQL — only touches columns that are always present.
    const [rows] = await seq.query(
      'SELECT id FROM users WHERE email = :email LIMIT 1',
      { replacements: { email: adminEmail } }
    ) as [Array<{ id: number }>, unknown];

    if (rows.length > 0) return; // admin already exists

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await seq.query(
      `INSERT INTO users (name, phone, email, password_hash, role, created_at, updated_at)
       VALUES (:name, :phone, :email, :hash, 'admin', NOW(), NOW())`,
      { replacements: { name: 'Admin', phone: adminPhone, email: adminEmail, hash: passwordHash } }
    );
    console.log(`[seed] Admin user created: ${adminEmail}`);
  } catch (err) {
    console.error('[seed] Failed to seed admin user:', (err as Error).message);
  }
}

async function bootstrap(): Promise<void> {
  await sequelize.authenticate();
  console.log('Database connection established.');

  // Create any brand-new tables (new models). Does NOT alter existing tables.
  await sequelize.sync({ alter: false });
  console.log('Database tables synced.');

  // Add missing columns to existing tables without touching indexes or dropping data.
  await runMigrations(sequelize);

  // Ensure the default admin account always exists.
  await seedAdmin(sequelize);

  app.listen(config.port, () => {
    console.log(`[${config.appName}] Server running on port ${config.port} (${config.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
