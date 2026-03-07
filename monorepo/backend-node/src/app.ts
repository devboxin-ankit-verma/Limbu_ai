/**
 * Main application entry point.
 *
 * Initializes Express, HTTP server, Socket.IO, and dependencies.
 */

import http from 'http';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { createRoutes } from './routes';
import { registerRepositories } from './dependencies/register';
import { sendSuccess } from './utils/response';
import { createSocketServer } from './lib/socket';

const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = createSocketServer(server);
app.set('io', io);

registerRepositories(app);

app.use('/api/v1', createRoutes(app));

app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'healthy' });
});

app.use(errorHandler);

const PORT = config.port;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
