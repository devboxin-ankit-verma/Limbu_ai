/**
 * Main application entry point.
 *
 * Initializes the database connection, then starts Express.
 */

import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { routes } from './routes';
import { registerRepositories } from './dependencies/register';
import sequelize from './database/connection';

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

async function bootstrap(): Promise<void> {
  await sequelize.authenticate();
  console.log('Database connection established.');

  // Avoid `alter` in MySQL dev to prevent repeated index creation (ER_TOO_MANY_KEYS).
  // Prefer explicit migrations for schema changes.
  await sequelize.sync({ alter: false });
  console.log('Database tables synced.');

  app.listen(config.port, () => {
    console.log(`[${config.appName}] Server running on port ${config.port} (${config.nodeEnv})`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
