/**
 * Environment Configuration
 * Centralized access to environment variables with type safety
 */

export const env = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,

  // Application Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Personal Health Platform',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',

  // Feature Flags
  enableGenomics: import.meta.env.VITE_ENABLE_GENOMICS === 'true',
  enableAIInsights: import.meta.env.VITE_ENABLE_AI_INSIGHTS === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',

  // Authentication
  authTokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'authToken',
  authRefreshTokenKey: import.meta.env.VITE_AUTH_REFRESH_TOKEN_KEY || 'refreshToken',

  // Chart Configuration
  chartAnimationDuration: Number(import.meta.env.VITE_CHART_ANIMATION_DURATION) || 750,
  chartDefaultPeriod: import.meta.env.VITE_CHART_DEFAULT_PERIOD || 'week',

  // File Upload
  maxFileSize: Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760, // 10MB
  allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['.vcf', '.txt', '.csv'],

  // Computed values
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Type for environment configuration
export type EnvConfig = typeof env;

// Validate required environment variables
export function validateEnv(): void {
  const required = ['VITE_API_BASE_URL'];
  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
}

// Run validation on module load
if (env.isDevelopment) {
  validateEnv();
}
