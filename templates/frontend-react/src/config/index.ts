/**
 * Application configuration.
 * 
 * This module loads and validates all environment variables.
 * NEVER access import.meta.env directly - always use this config.
 */

interface Config {
  apiBaseUrl: string;
  appName: string;
  appVersion: string;
}

/**
 * Application configuration loaded from environment variables.
 * 
 * All environment variables must be defined in .env.example
 * and accessed through this config object.
 */
export const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  appName: import.meta.env.VITE_APP_NAME || 'Frontend App',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0'
};
