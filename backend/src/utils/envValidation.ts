import { validateSecurityPolicy, validatePerformanceConfig } from '../config/security';

/**
 * 필수 환경 변수 목록
 */
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY',
  'REDIS_URL'
] as const;

/**
 * 선택적 환경 변수 목록 (기본값 있음)
 */
const OPTIONAL_ENV_VARS = [
  'PORT',
  'NODE_ENV',
  'LOG_LEVEL',
  'REDIS_COMPRESSION',
  'PERFORMANCE_MONITORING_ENABLED',
  'AUTO_OPTIMIZATION_ENABLED',
  'SECURITY_ALERT_EMAIL',
  'INTRUSION_DETECTION_ENABLED'
] as const;

/**
 * 환경 변수 검증 결과
 */
export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
  recommendations: string[];
}

/**
 * 환경 변수 검증
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    missing: [],
    recommendations: []
  };

  // 필수 환경 변수 확인
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      result.missing.push(envVar);
      result.errors.push(`Missing required environment variable: ${envVar}`);
      result.isValid = false;
    }
  }

  // 보안 관련 검증
  if (!validateSecurityPolicy()) {
    result.errors.push('Security policy validation failed');
    result.isValid = false;
  }

  // 성능 관련 검증
  if (!validatePerformanceConfig()) {
    result.warnings.push('Performance configuration validation failed');
  }

  // JWT Secret 강도 검증
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    result.errors.push('JWT_SECRET must be at least 32 characters long');
    result.isValid = false;
  }

  // 암호화 키 검증
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (encryptionKey && encryptionKey.length !== 32) {
    result.errors.push('ENCRYPTION_KEY must be exactly 32 characters long');
    result.isValid = false;
  }

  // 데이터베이스 URL 형식 검증
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && !databaseUrl.startsWith('postgresql://')) {
    result.warnings.push('DATABASE_URL should use postgresql:// protocol for PostgreSQL');
  }

  // Redis URL 형식 검증
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl && !redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
    result.warnings.push('REDIS_URL should use redis:// or rediss:// protocol');
  }

  // 프로덕션 환경 특별 검증
  if (process.env.NODE_ENV === 'production') {
    // HTTPS 관련 검증
    if (!process.env.SSL_CERT_PATH || !process.env.SSL_KEY_PATH) {
      result.warnings.push('SSL certificates not configured for production environment');
    }

    // 보안 헤더 검증
    if (!process.env.SECURITY_ALERT_EMAIL) {
      result.warnings.push('SECURITY_ALERT_EMAIL not configured for production');
    }

    // 메모리 제한 검증
    if (!process.env.NODE_OPTIONS?.includes('--max-old-space-size')) {
      result.recommendations.push('Consider setting NODE_OPTIONS="--max-old-space-size=4096" for production');
    }
  }

  // 개발 환경 권장사항
  if (process.env.NODE_ENV === 'development') {
    result.recommendations.push('Enable detailed logging with LOG_LEVEL=debug for development');
    result.recommendations.push('Consider using nodemon for auto-restart during development');
  }

  return result;
}

/**
 * 환경 변수 기본값 설정
 */
export function setDefaultEnvironmentVariables(): void {
  const defaults = {
    PORT: '5000',
    NODE_ENV: 'development',
    LOG_LEVEL: 'info',
    REDIS_COMPRESSION: 'true',
    PERFORMANCE_MONITORING_ENABLED: 'true',
    AUTO_OPTIMIZATION_ENABLED: 'true',
    INTRUSION_DETECTION_ENABLED: 'true',
    METRICS_COLLECTION_INTERVAL_MS: '60000',
    SLOW_QUERY_THRESHOLD_MS: '100',
    CACHE_DEFAULT_TTL: '300',
    RATE_LIMIT_WINDOW_MS: '900000',
    RATE_LIMIT_MAX_REQUESTS: '100'
  };

  for (const [key, value] of Object.entries(defaults)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

/**
 * 환경 변수 보고서 생성
 */
export function generateEnvironmentReport(): {
  environment: string;
  configuredVars: string[];
  missingVars: string[];
  securityLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
} {
  const validation = validateEnvironmentVariables();
  
  const configuredVars = [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS]
    .filter(varName => process.env[varName]);

  const missingVars = [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS]
    .filter(varName => !process.env[varName]);

  // 보안 수준 계산
  let securityLevel: 'low' | 'medium' | 'high' = 'high';
  if (validation.errors.length > 0) {
    securityLevel = 'low';
  } else if (validation.warnings.length > 2) {
    securityLevel = 'medium';
  }

  return {
    environment: process.env.NODE_ENV || 'development',
    configuredVars,
    missingVars,
    securityLevel,
    recommendations: validation.recommendations
  };
}

/**
 * 환경 변수 마스킹 (로깅용)
 */
export function maskSensitiveEnvVars(): Record<string, string> {
  const sensitiveVars = [
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'DATABASE_URL',
    'REDIS_URL',
    'OPENAI_API_KEY',
    'AWS_SECRET_ACCESS_KEY',
    'SMTP_PASS'
  ];

  const maskedEnv: Record<string, string> = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (sensitiveVars.some(sensitive => key.includes(sensitive))) {
      maskedEnv[key] = value ? `${value.substring(0, 4)}****` : 'undefined';
    } else {
      maskedEnv[key] = value || 'undefined';
    }
  }

  return maskedEnv;
}

/**
 * 환경 변수 검증 및 초기화
 */
export function initializeEnvironment(): boolean {
  console.log('🔧 Initializing environment configuration...');

  // 기본값 설정
  setDefaultEnvironmentVariables();

  // 환경 변수 검증
  const validation = validateEnvironmentVariables();

  // 검증 결과 출력
  if (validation.errors.length > 0) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (validation.recommendations.length > 0) {
    console.info('💡 Environment recommendations:');
    validation.recommendations.forEach(rec => console.info(`  - ${rec}`));
  }

  console.log('✅ Environment configuration initialized successfully');
  return true;
}

export default {
  validateEnvironmentVariables,
  setDefaultEnvironmentVariables,
  generateEnvironmentReport,
  maskSensitiveEnvVars,
  initializeEnvironment
};