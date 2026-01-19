/**
 * Application configuration.
 * 
 * This module loads and validates all environment variables.
 * NEVER access process.env directly - always use this config.
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  // Application
  appName: string;
  appVersion: string;
  port: number;
  debug: boolean;
  
  // Database
  databaseUrl: string;
  
  // Security
  secretKey: string;
  algorithm: string;
  accessTokenExpireMinutes: number;
  
  // CORS
  corsOrigins: string[];
  
  // Logging
  logLevel: string;
}

/**
 * Validate required environment variables.
 */
function validateEnv(): void {
  const required = [
    'DATABASE_URL',
    'SECRET_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Validate environment variables on load
validateEnv();

/**
 * Application configuration loaded from environment variables.
 * 
 * All environment variables must be defined in .env.example
 * and accessed through this config object.
 */
export const config: Config = {
  // Application
  appName: process.env.APP_NAME || 'Backend API',
  appVersion: process.env.APP_VERSION || '1.0.0',
  port: parseInt(process.env.PORT || '8000', 10),
  debug: process.env.DEBUG === 'true',
  
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  
  // Security
  secretKey: process.env.SECRET_KEY!,
  algorithm: process.env.ALGORITHM || 'HS256',
  accessTokenExpireMinutes: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '30', 10),
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'INFO'
};
