/**
 * Application configuration.
 * 
 * This module loads and validates all environment variables.
 * NEVER access import.meta.env directly - always use this config.
 */

interface Config {
  apiBaseUrl: string;
  wsUrl: string;
  appName: string;
  appVersion: string;
}

/**
 * Application configuration loaded from environment variables.
 * All env vars must be in .env.example.
 */
export const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  wsUrl: import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  appName: import.meta.env.VITE_APP_NAME || 'SHARE-MARKET',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
};
