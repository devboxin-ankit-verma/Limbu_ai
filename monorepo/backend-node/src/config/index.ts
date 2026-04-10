/**
 * Application configuration.
 *
 * Loads and validates all environment variables.
 * NEVER access process.env directly — always use this config object.
 */

import dotenv from 'dotenv';

dotenv.config();

interface DbConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

interface JwtConfig {
  secret: string;
  expirySeconds: number;
  refreshExpirySeconds: number;
}

interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

interface Config {
  appName: string;
  appVersion: string;
  port: number;
  debug: boolean;
  nodeEnv: string;
  db: DbConfig;
  jwt: JwtConfig;
  razorpay: RazorpayConfig;
  corsOrigins: string[];
  logLevel: string;
  providerRegistrationFee: number;
  allowDevPaymentBypass: boolean;
  uploadDir: string;
}

function validateEnv(): void {
  // DB_PASSWORD is intentionally excluded — empty string is valid for local dev (root with no password)
  const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
  const missing = required.filter((key) => process.env[key] === undefined || process.env[key] === '');
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

validateEnv();

export const config: Config = {
  appName: process.env.APP_NAME || 'Dai Massage API',
  appVersion: process.env.APP_VERSION || '1.0.0',
  port: parseInt(process.env.PORT || '8000', 10),
  debug: process.env.DEBUG === 'true',
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    name: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD ?? '',
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expirySeconds: parseInt(process.env.JWT_EXPIRY_SECONDS || String(7 * 24 * 60 * 60), 10),
    refreshExpirySeconds: parseInt(process.env.JWT_REFRESH_EXPIRY_SECONDS || String(30 * 24 * 60 * 60), 10),
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },

  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  logLevel: process.env.LOG_LEVEL || 'INFO',
  providerRegistrationFee: parseInt(process.env.PROVIDER_REGISTRATION_FEE || '99900', 10),
  allowDevPaymentBypass: process.env.ALLOW_DEV_PAYMENT_BYPASS === 'true',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
};
