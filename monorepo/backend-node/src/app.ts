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
import { runMigrations } from './database/migrate';
import { UserModel } from './models/UserModel';

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

/** Ensures a default admin account exists so the panel is always accessible. */
async function seedAdmin(): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@daimassage.com';
    const adminPhone = process.env.ADMIN_PHONE || '9000000000';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existing = await UserModel.findOne({ where: { email: adminEmail }, paranoid: false });
    if (existing) return;

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await UserModel.create({
      name: 'Admin',
      phone: adminPhone,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      age: null,
      gender: null,
      referredByProviderId: null,
    });
    console.log(`[seed] Admin user created: ${adminEmail}`);
  } catch (err) {
    console.error('[seed] Failed to seed admin user:', err);
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
  await seedAdmin();

  app.listen(config.port, () => {
    console.log(`[${config.appName}] Server running on port ${config.port} (${config.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
