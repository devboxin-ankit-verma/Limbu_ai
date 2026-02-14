/**
 * Register app-scoped dependencies (repositories, etc.) on the Express app.
 * Keeps app.ts clean; add new repositories here as the app grows.
 */

import { Express } from 'express';
import { UserRepository } from '../repositories/userRepository';

/**
 * Attach all repositories to the app for request-time resolution.
 * Controllers resolve them via req.app.get("userRepository"), etc.
 */
export function registerRepositories(app: Express): void {
  app.set('userRepository', new UserRepository());
  // Add more as needed: app.set('productRepository', new ProductRepository()); etc.
}
