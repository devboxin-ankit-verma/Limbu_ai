/**
 * Main application entry point.
 * 
 * This module initializes the Express application and sets up all routes.
 */

import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { routes } from './routes';
import { registerRepositories } from './dependencies/register';

// Initialize Express app
const app: Express = express();

// Register repositories (and other app-scoped deps) in one place
registerRepositories(app);

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
