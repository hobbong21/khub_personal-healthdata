export const SECURITY_CONFIG = {
  // 암호화 설정
  ENCRYPTION: {
    ALGORITHM: 'aes-256-gcm',
    KEY_LENGTH: 32,
    IV_LENGTH: 16,
    TAG_LENGTH: 16,
    SALT_ROUNDS: 12
  },

  // 세션 및 토큰 설정
  SESSION: {
    TIMEOUT_MINUTES: 30,
    REFRESH_THRESHOLD_MINUTES: 5,
    MAX_CONCURRENT_SESSIONS: 3
  },

  // Rate Limiting 설정
  RATE_LIMITS: {
    GENERAL: {
      WINDOW_MS: 15 * 60 * 1000, // 15분
      MAX_REQUESTS: 100
    },
    AUTH: {
      WINDOW_MS: 15 * 60 * 1000, // 15분
      MAX_REQUESTS: 5
    },
    SENSITIVE_DATA: {
      WINDOW_MS: 15 * 60 * 1000, // 15분
      MAX_REQUESTS: 50
    },
    FILE_UPLOAD: {
      WINDOW_MS: 60 * 60 * 1000, // 1시간
      MAX_REQUESTS: 10
    }
  },

  // 파일 업로드 보안
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'text/csv'
    ],
    SCAN_FOR_MALWARE: true,
    QUARANTINE_SUSPICIOUS: true
  },

  // 감사 로그 설정
  AUDIT: {
    RETENTION_DAYS: 2555, // 7년 (HIPAA 요구사항)
    ENCRYPTION_REQUIRED: true,
    TAMPER_PROTECTION: true,
    BACKUP_FREQUENCY_HOURS: 24
  },

  // 보안 헤더 설정
  HEADERS: {
    HSTS_MAX_AGE: 31536000, // 1년
    CSP_DIRECTIVES: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },

  // 침입 탐지 설정
  INTRUSION_DETECTION: {
    FAILED_LOGIN_THRESHOLD: 5,
    SUSPICIOUS_ACTIVITY_THRESHOLD: 10,
    IP_BLOCK_DURATION_MINUTES: 60,
    PATTERN_DETECTION_ENABLED: true
  },

  // 데이터 보호 설정
  DATA_PROTECTION: {
    PII_MASKING_ENABLED: true,
    AUTOMATIC_ANONYMIZATION: true,
    GDPR_COMPLIANCE: true,
    HIPAA_COMPLIANCE: true,
    DATA_RETENTION_DAYS: 2555 // 7년
  }
} as const;

export const PERFORMANCE_CONFIG = {
  // 데이터베이스 최적화
  DATABASE: {
    CONNECTION_POOL_SIZE: 20,
    QUERY_TIMEOUT_MS: 30000,
    SLOW_QUERY_THRESHOLD_MS: 100,
    INDEX_OPTIMIZATION_ENABLED: true,
    QUERY_CACHE_ENABLED: true
  },

  // 캐시 설정
  CACHE: {
    DEFAULT_TTL_SECONDS: 300, // 5분
    MAX_MEMORY_MB: 512,
    COMPRESSION_ENABLED: true,
    COMPRESSION_THRESHOLD_BYTES: 1024,
    EVICTION_POLICY: 'allkeys-lru'
  },

  // API 성능 설정
  API: {
    RESPONSE_TIME_THRESHOLD_MS: 500,
    PAGINATION_DEFAULT_LIMIT: 20,
    PAGINATION_MAX_LIMIT: 100,
    COMPRESSION_ENABLED: true,
    KEEP_ALIVE_ENABLED: true
  },

  // 메모리 관리
  MEMORY: {
    HEAP_WARNING_THRESHOLD_PERCENT: 80,
    HEAP_CRITICAL_THRESHOLD_PERCENT: 90,
    GC_OPTIMIZATION_ENABLED: true,
    MEMORY_LEAK_DETECTION: true
  },

  // 모니터링 설정
  MONITORING: {
    METRICS_COLLECTION_INTERVAL_MS: 60000, // 1분
    PERFORMANCE_REPORT_INTERVAL_MS: 1800000, // 30분
    ALERT_THRESHOLDS: {
      CPU_USAGE_PERCENT: 80,
      MEMORY_USAGE_PERCENT: 85,
      DISK_USAGE_PERCENT: 90,
      RESPONSE_TIME_MS: 1000,
      ERROR_RATE_PERCENT: 5
    }
  },

  // 자동 최적화 설정
  AUTO_OPTIMIZATION: {
    ENABLED: true,
    CACHE_TTL_ADJUSTMENT: true,
    INDEX_CREATION: true,
    MEMORY_CLEANUP: true,
    QUERY_OPTIMIZATION: false // 수동 검토 필요
  }
} as const;

// 환경별 설정 오버라이드
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  
  const envConfigs = {
    development: {
      SECURITY: {
        ...SECURITY_CONFIG,
        RATE_LIMITS: {
          ...SECURITY_CONFIG.RATE_LIMITS,
          GENERAL: { ...SECURITY_CONFIG.RATE_LIMITS.GENERAL, MAX_REQUESTS: 1000 }
        }
      },
      PERFORMANCE: {
        ...PERFORMANCE_CONFIG,
        MONITORING: {
          ...PERFORMANCE_CONFIG.MONITORING,
          METRICS_COLLECTION_INTERVAL_MS: 30000 // 30초
        }
      }
    },
    
    production: {
      SECURITY: {
        ...SECURITY_CONFIG,
        INTRUSION_DETECTION: {
          ...SECURITY_CONFIG.INTRUSION_DETECTION,
          FAILED_LOGIN_THRESHOLD: 3,
          IP_BLOCK_DURATION_MINUTES: 120
        }
      },
      PERFORMANCE: {
        ...PERFORMANCE_CONFIG,
        DATABASE: {
          ...PERFORMANCE_CONFIG.DATABASE,
          CONNECTION_POOL_SIZE: 50
        },
        CACHE: {
          ...PERFORMANCE_CONFIG.CACHE,
          MAX_MEMORY_MB: 2048
        }
      }
    },
    
    test: {
      SECURITY: {
        ...SECURITY_CONFIG,
        RATE_LIMITS: {
          GENERAL: { WINDOW_MS: 1000, MAX_REQUESTS: 1000 },
          AUTH: { WINDOW_MS: 1000, MAX_REQUESTS: 100 },
          SENSITIVE_DATA: { WINDOW_MS: 1000, MAX_REQUESTS: 500 },
          FILE_UPLOAD: { WINDOW_MS: 1000, MAX_REQUESTS: 100 }
        }
      },
      PERFORMANCE: {
        ...PERFORMANCE_CONFIG,
        MONITORING: {
          ...PERFORMANCE_CONFIG.MONITORING,
          METRICS_COLLECTION_INTERVAL_MS: 5000 // 5초
        }
      }
    }
  };

  return envConfigs[env as keyof typeof envConfigs] || envConfigs.development;
}

// 보안 정책 검증
export function validateSecurityPolicy(): boolean {
  const requiredEnvVars = [
    'ENCRYPTION_KEY',
    'JWT_SECRET',
    'DATABASE_URL',
    'REDIS_URL'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }

  // 암호화 키 강도 검증
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (encryptionKey && encryptionKey.length < 32) {
    console.error('Encryption key must be at least 32 characters long');
    return false;
  }

  return true;
}

// 성능 설정 검증
export function validatePerformanceConfig(): boolean {
  const memoryLimit = process.env.NODE_OPTIONS?.includes('--max-old-space-size');
  
  if (!memoryLimit && process.env.NODE_ENV === 'production') {
    console.warn('Consider setting NODE_OPTIONS="--max-old-space-size=4096" for production');
  }

  return true;
}