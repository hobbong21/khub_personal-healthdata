export declare const SECURITY_CONFIG: {
    readonly ENCRYPTION: {
        readonly ALGORITHM: "aes-256-gcm";
        readonly KEY_LENGTH: 32;
        readonly IV_LENGTH: 16;
        readonly TAG_LENGTH: 16;
        readonly SALT_ROUNDS: 12;
    };
    readonly SESSION: {
        readonly TIMEOUT_MINUTES: 30;
        readonly REFRESH_THRESHOLD_MINUTES: 5;
        readonly MAX_CONCURRENT_SESSIONS: 3;
    };
    readonly RATE_LIMITS: {
        readonly GENERAL: {
            readonly WINDOW_MS: number;
            readonly MAX_REQUESTS: 100;
        };
        readonly AUTH: {
            readonly WINDOW_MS: number;
            readonly MAX_REQUESTS: 5;
        };
        readonly SENSITIVE_DATA: {
            readonly WINDOW_MS: number;
            readonly MAX_REQUESTS: 50;
        };
        readonly FILE_UPLOAD: {
            readonly WINDOW_MS: number;
            readonly MAX_REQUESTS: 10;
        };
    };
    readonly FILE_UPLOAD: {
        readonly MAX_SIZE: number;
        readonly ALLOWED_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain", "text/csv"];
        readonly SCAN_FOR_MALWARE: true;
        readonly QUARANTINE_SUSPICIOUS: true;
    };
    readonly AUDIT: {
        readonly RETENTION_DAYS: 2555;
        readonly ENCRYPTION_REQUIRED: true;
        readonly TAMPER_PROTECTION: true;
        readonly BACKUP_FREQUENCY_HOURS: 24;
    };
    readonly HEADERS: {
        readonly HSTS_MAX_AGE: 31536000;
        readonly CSP_DIRECTIVES: {
            readonly defaultSrc: readonly ["'self'"];
            readonly styleSrc: readonly ["'self'", "'unsafe-inline'"];
            readonly scriptSrc: readonly ["'self'"];
            readonly imgSrc: readonly ["'self'", "data:", "https:"];
            readonly connectSrc: readonly ["'self'"];
            readonly fontSrc: readonly ["'self'"];
            readonly objectSrc: readonly ["'none'"];
            readonly mediaSrc: readonly ["'self'"];
            readonly frameSrc: readonly ["'none'"];
        };
    };
    readonly INTRUSION_DETECTION: {
        readonly FAILED_LOGIN_THRESHOLD: 5;
        readonly SUSPICIOUS_ACTIVITY_THRESHOLD: 10;
        readonly IP_BLOCK_DURATION_MINUTES: 60;
        readonly PATTERN_DETECTION_ENABLED: true;
    };
    readonly DATA_PROTECTION: {
        readonly PII_MASKING_ENABLED: true;
        readonly AUTOMATIC_ANONYMIZATION: true;
        readonly GDPR_COMPLIANCE: true;
        readonly HIPAA_COMPLIANCE: true;
        readonly DATA_RETENTION_DAYS: 2555;
    };
};
export declare const PERFORMANCE_CONFIG: {
    readonly DATABASE: {
        readonly CONNECTION_POOL_SIZE: 20;
        readonly QUERY_TIMEOUT_MS: 30000;
        readonly SLOW_QUERY_THRESHOLD_MS: 100;
        readonly INDEX_OPTIMIZATION_ENABLED: true;
        readonly QUERY_CACHE_ENABLED: true;
    };
    readonly CACHE: {
        readonly DEFAULT_TTL_SECONDS: 300;
        readonly MAX_MEMORY_MB: 512;
        readonly COMPRESSION_ENABLED: true;
        readonly COMPRESSION_THRESHOLD_BYTES: 1024;
        readonly EVICTION_POLICY: "allkeys-lru";
    };
    readonly API: {
        readonly RESPONSE_TIME_THRESHOLD_MS: 500;
        readonly PAGINATION_DEFAULT_LIMIT: 20;
        readonly PAGINATION_MAX_LIMIT: 100;
        readonly COMPRESSION_ENABLED: true;
        readonly KEEP_ALIVE_ENABLED: true;
    };
    readonly MEMORY: {
        readonly HEAP_WARNING_THRESHOLD_PERCENT: 80;
        readonly HEAP_CRITICAL_THRESHOLD_PERCENT: 90;
        readonly GC_OPTIMIZATION_ENABLED: true;
        readonly MEMORY_LEAK_DETECTION: true;
    };
    readonly MONITORING: {
        readonly METRICS_COLLECTION_INTERVAL_MS: 60000;
        readonly PERFORMANCE_REPORT_INTERVAL_MS: 1800000;
        readonly ALERT_THRESHOLDS: {
            readonly CPU_USAGE_PERCENT: 80;
            readonly MEMORY_USAGE_PERCENT: 85;
            readonly DISK_USAGE_PERCENT: 90;
            readonly RESPONSE_TIME_MS: 1000;
            readonly ERROR_RATE_PERCENT: 5;
        };
    };
    readonly AUTO_OPTIMIZATION: {
        readonly ENABLED: true;
        readonly CACHE_TTL_ADJUSTMENT: true;
        readonly INDEX_CREATION: true;
        readonly MEMORY_CLEANUP: true;
        readonly QUERY_OPTIMIZATION: false;
    };
};
export declare function getEnvironmentConfig(): {
    SECURITY: {
        RATE_LIMITS: {
            GENERAL: {
                MAX_REQUESTS: number;
                WINDOW_MS: number;
            };
            AUTH: {
                readonly WINDOW_MS: number;
                readonly MAX_REQUESTS: 5;
            };
            SENSITIVE_DATA: {
                readonly WINDOW_MS: number;
                readonly MAX_REQUESTS: 50;
            };
            FILE_UPLOAD: {
                readonly WINDOW_MS: number;
                readonly MAX_REQUESTS: 10;
            };
        };
        ENCRYPTION: {
            readonly ALGORITHM: "aes-256-gcm";
            readonly KEY_LENGTH: 32;
            readonly IV_LENGTH: 16;
            readonly TAG_LENGTH: 16;
            readonly SALT_ROUNDS: 12;
        };
        SESSION: {
            readonly TIMEOUT_MINUTES: 30;
            readonly REFRESH_THRESHOLD_MINUTES: 5;
            readonly MAX_CONCURRENT_SESSIONS: 3;
        };
        FILE_UPLOAD: {
            readonly MAX_SIZE: number;
            readonly ALLOWED_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain", "text/csv"];
            readonly SCAN_FOR_MALWARE: true;
            readonly QUARANTINE_SUSPICIOUS: true;
        };
        AUDIT: {
            readonly RETENTION_DAYS: 2555;
            readonly ENCRYPTION_REQUIRED: true;
            readonly TAMPER_PROTECTION: true;
            readonly BACKUP_FREQUENCY_HOURS: 24;
        };
        HEADERS: {
            readonly HSTS_MAX_AGE: 31536000;
            readonly CSP_DIRECTIVES: {
                readonly defaultSrc: readonly ["'self'"];
                readonly styleSrc: readonly ["'self'", "'unsafe-inline'"];
                readonly scriptSrc: readonly ["'self'"];
                readonly imgSrc: readonly ["'self'", "data:", "https:"];
                readonly connectSrc: readonly ["'self'"];
                readonly fontSrc: readonly ["'self'"];
                readonly objectSrc: readonly ["'none'"];
                readonly mediaSrc: readonly ["'self'"];
                readonly frameSrc: readonly ["'none'"];
            };
        };
        INTRUSION_DETECTION: {
            readonly FAILED_LOGIN_THRESHOLD: 5;
            readonly SUSPICIOUS_ACTIVITY_THRESHOLD: 10;
            readonly IP_BLOCK_DURATION_MINUTES: 60;
            readonly PATTERN_DETECTION_ENABLED: true;
        };
        DATA_PROTECTION: {
            readonly PII_MASKING_ENABLED: true;
            readonly AUTOMATIC_ANONYMIZATION: true;
            readonly GDPR_COMPLIANCE: true;
            readonly HIPAA_COMPLIANCE: true;
            readonly DATA_RETENTION_DAYS: 2555;
        };
    };
    PERFORMANCE: {
        MONITORING: {
            METRICS_COLLECTION_INTERVAL_MS: number;
            PERFORMANCE_REPORT_INTERVAL_MS: 1800000;
            ALERT_THRESHOLDS: {
                readonly CPU_USAGE_PERCENT: 80;
                readonly MEMORY_USAGE_PERCENT: 85;
                readonly DISK_USAGE_PERCENT: 90;
                readonly RESPONSE_TIME_MS: 1000;
                readonly ERROR_RATE_PERCENT: 5;
            };
        };
        DATABASE: {
            readonly CONNECTION_POOL_SIZE: 20;
            readonly QUERY_TIMEOUT_MS: 30000;
            readonly SLOW_QUERY_THRESHOLD_MS: 100;
            readonly INDEX_OPTIMIZATION_ENABLED: true;
            readonly QUERY_CACHE_ENABLED: true;
        };
        CACHE: {
            readonly DEFAULT_TTL_SECONDS: 300;
            readonly MAX_MEMORY_MB: 512;
            readonly COMPRESSION_ENABLED: true;
            readonly COMPRESSION_THRESHOLD_BYTES: 1024;
            readonly EVICTION_POLICY: "allkeys-lru";
        };
        API: {
            readonly RESPONSE_TIME_THRESHOLD_MS: 500;
            readonly PAGINATION_DEFAULT_LIMIT: 20;
            readonly PAGINATION_MAX_LIMIT: 100;
            readonly COMPRESSION_ENABLED: true;
            readonly KEEP_ALIVE_ENABLED: true;
        };
        MEMORY: {
            readonly HEAP_WARNING_THRESHOLD_PERCENT: 80;
            readonly HEAP_CRITICAL_THRESHOLD_PERCENT: 90;
            readonly GC_OPTIMIZATION_ENABLED: true;
            readonly MEMORY_LEAK_DETECTION: true;
        };
        AUTO_OPTIMIZATION: {
            readonly ENABLED: true;
            readonly CACHE_TTL_ADJUSTMENT: true;
            readonly INDEX_CREATION: true;
            readonly MEMORY_CLEANUP: true;
            readonly QUERY_OPTIMIZATION: false;
        };
    };
} | {
    SECURITY: {
        INTRUSION_DETECTION: {
            FAILED_LOGIN_THRESHOLD: number;
            IP_BLOCK_DURATION_MINUTES: number;
            SUSPICIOUS_ACTIVITY_THRESHOLD: 10;
            PATTERN_DETECTION_ENABLED: true;
        };
        ENCRYPTION: {
            readonly ALGORITHM: "aes-256-gcm";
            readonly KEY_LENGTH: 32;
            readonly IV_LENGTH: 16;
            readonly TAG_LENGTH: 16;
            readonly SALT_ROUNDS: 12;
        };
        SESSION: {
            readonly TIMEOUT_MINUTES: 30;
            readonly REFRESH_THRESHOLD_MINUTES: 5;
            readonly MAX_CONCURRENT_SESSIONS: 3;
        };
        RATE_LIMITS: {
            readonly GENERAL: {
                readonly WINDOW_MS: number;
                readonly MAX_REQUESTS: 100;
            };
            readonly AUTH: {
                readonly WINDOW_MS: number;
                readonly MAX_REQUESTS: 5;
            };
            readonly SENSITIVE_DATA: {
                readonly WINDOW_MS: number;
                readonly MAX_REQUESTS: 50;
            };
            readonly FILE_UPLOAD: {
                readonly WINDOW_MS: number;
                readonly MAX_REQUESTS: 10;
            };
        };
        FILE_UPLOAD: {
            readonly MAX_SIZE: number;
            readonly ALLOWED_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain", "text/csv"];
            readonly SCAN_FOR_MALWARE: true;
            readonly QUARANTINE_SUSPICIOUS: true;
        };
        AUDIT: {
            readonly RETENTION_DAYS: 2555;
            readonly ENCRYPTION_REQUIRED: true;
            readonly TAMPER_PROTECTION: true;
            readonly BACKUP_FREQUENCY_HOURS: 24;
        };
        HEADERS: {
            readonly HSTS_MAX_AGE: 31536000;
            readonly CSP_DIRECTIVES: {
                readonly defaultSrc: readonly ["'self'"];
                readonly styleSrc: readonly ["'self'", "'unsafe-inline'"];
                readonly scriptSrc: readonly ["'self'"];
                readonly imgSrc: readonly ["'self'", "data:", "https:"];
                readonly connectSrc: readonly ["'self'"];
                readonly fontSrc: readonly ["'self'"];
                readonly objectSrc: readonly ["'none'"];
                readonly mediaSrc: readonly ["'self'"];
                readonly frameSrc: readonly ["'none'"];
            };
        };
        DATA_PROTECTION: {
            readonly PII_MASKING_ENABLED: true;
            readonly AUTOMATIC_ANONYMIZATION: true;
            readonly GDPR_COMPLIANCE: true;
            readonly HIPAA_COMPLIANCE: true;
            readonly DATA_RETENTION_DAYS: 2555;
        };
    };
    PERFORMANCE: {
        DATABASE: {
            CONNECTION_POOL_SIZE: number;
            QUERY_TIMEOUT_MS: 30000;
            SLOW_QUERY_THRESHOLD_MS: 100;
            INDEX_OPTIMIZATION_ENABLED: true;
            QUERY_CACHE_ENABLED: true;
        };
        CACHE: {
            MAX_MEMORY_MB: number;
            DEFAULT_TTL_SECONDS: 300;
            COMPRESSION_ENABLED: true;
            COMPRESSION_THRESHOLD_BYTES: 1024;
            EVICTION_POLICY: "allkeys-lru";
        };
        API: {
            readonly RESPONSE_TIME_THRESHOLD_MS: 500;
            readonly PAGINATION_DEFAULT_LIMIT: 20;
            readonly PAGINATION_MAX_LIMIT: 100;
            readonly COMPRESSION_ENABLED: true;
            readonly KEEP_ALIVE_ENABLED: true;
        };
        MEMORY: {
            readonly HEAP_WARNING_THRESHOLD_PERCENT: 80;
            readonly HEAP_CRITICAL_THRESHOLD_PERCENT: 90;
            readonly GC_OPTIMIZATION_ENABLED: true;
            readonly MEMORY_LEAK_DETECTION: true;
        };
        MONITORING: {
            readonly METRICS_COLLECTION_INTERVAL_MS: 60000;
            readonly PERFORMANCE_REPORT_INTERVAL_MS: 1800000;
            readonly ALERT_THRESHOLDS: {
                readonly CPU_USAGE_PERCENT: 80;
                readonly MEMORY_USAGE_PERCENT: 85;
                readonly DISK_USAGE_PERCENT: 90;
                readonly RESPONSE_TIME_MS: 1000;
                readonly ERROR_RATE_PERCENT: 5;
            };
        };
        AUTO_OPTIMIZATION: {
            readonly ENABLED: true;
            readonly CACHE_TTL_ADJUSTMENT: true;
            readonly INDEX_CREATION: true;
            readonly MEMORY_CLEANUP: true;
            readonly QUERY_OPTIMIZATION: false;
        };
    };
} | {
    SECURITY: {
        RATE_LIMITS: {
            GENERAL: {
                WINDOW_MS: number;
                MAX_REQUESTS: number;
            };
            AUTH: {
                WINDOW_MS: number;
                MAX_REQUESTS: number;
            };
            SENSITIVE_DATA: {
                WINDOW_MS: number;
                MAX_REQUESTS: number;
            };
            FILE_UPLOAD: {
                WINDOW_MS: number;
                MAX_REQUESTS: number;
            };
        };
        ENCRYPTION: {
            readonly ALGORITHM: "aes-256-gcm";
            readonly KEY_LENGTH: 32;
            readonly IV_LENGTH: 16;
            readonly TAG_LENGTH: 16;
            readonly SALT_ROUNDS: 12;
        };
        SESSION: {
            readonly TIMEOUT_MINUTES: 30;
            readonly REFRESH_THRESHOLD_MINUTES: 5;
            readonly MAX_CONCURRENT_SESSIONS: 3;
        };
        FILE_UPLOAD: {
            readonly MAX_SIZE: number;
            readonly ALLOWED_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain", "text/csv"];
            readonly SCAN_FOR_MALWARE: true;
            readonly QUARANTINE_SUSPICIOUS: true;
        };
        AUDIT: {
            readonly RETENTION_DAYS: 2555;
            readonly ENCRYPTION_REQUIRED: true;
            readonly TAMPER_PROTECTION: true;
            readonly BACKUP_FREQUENCY_HOURS: 24;
        };
        HEADERS: {
            readonly HSTS_MAX_AGE: 31536000;
            readonly CSP_DIRECTIVES: {
                readonly defaultSrc: readonly ["'self'"];
                readonly styleSrc: readonly ["'self'", "'unsafe-inline'"];
                readonly scriptSrc: readonly ["'self'"];
                readonly imgSrc: readonly ["'self'", "data:", "https:"];
                readonly connectSrc: readonly ["'self'"];
                readonly fontSrc: readonly ["'self'"];
                readonly objectSrc: readonly ["'none'"];
                readonly mediaSrc: readonly ["'self'"];
                readonly frameSrc: readonly ["'none'"];
            };
        };
        INTRUSION_DETECTION: {
            readonly FAILED_LOGIN_THRESHOLD: 5;
            readonly SUSPICIOUS_ACTIVITY_THRESHOLD: 10;
            readonly IP_BLOCK_DURATION_MINUTES: 60;
            readonly PATTERN_DETECTION_ENABLED: true;
        };
        DATA_PROTECTION: {
            readonly PII_MASKING_ENABLED: true;
            readonly AUTOMATIC_ANONYMIZATION: true;
            readonly GDPR_COMPLIANCE: true;
            readonly HIPAA_COMPLIANCE: true;
            readonly DATA_RETENTION_DAYS: 2555;
        };
    };
    PERFORMANCE: {
        MONITORING: {
            METRICS_COLLECTION_INTERVAL_MS: number;
            PERFORMANCE_REPORT_INTERVAL_MS: 1800000;
            ALERT_THRESHOLDS: {
                readonly CPU_USAGE_PERCENT: 80;
                readonly MEMORY_USAGE_PERCENT: 85;
                readonly DISK_USAGE_PERCENT: 90;
                readonly RESPONSE_TIME_MS: 1000;
                readonly ERROR_RATE_PERCENT: 5;
            };
        };
        DATABASE: {
            readonly CONNECTION_POOL_SIZE: 20;
            readonly QUERY_TIMEOUT_MS: 30000;
            readonly SLOW_QUERY_THRESHOLD_MS: 100;
            readonly INDEX_OPTIMIZATION_ENABLED: true;
            readonly QUERY_CACHE_ENABLED: true;
        };
        CACHE: {
            readonly DEFAULT_TTL_SECONDS: 300;
            readonly MAX_MEMORY_MB: 512;
            readonly COMPRESSION_ENABLED: true;
            readonly COMPRESSION_THRESHOLD_BYTES: 1024;
            readonly EVICTION_POLICY: "allkeys-lru";
        };
        API: {
            readonly RESPONSE_TIME_THRESHOLD_MS: 500;
            readonly PAGINATION_DEFAULT_LIMIT: 20;
            readonly PAGINATION_MAX_LIMIT: 100;
            readonly COMPRESSION_ENABLED: true;
            readonly KEEP_ALIVE_ENABLED: true;
        };
        MEMORY: {
            readonly HEAP_WARNING_THRESHOLD_PERCENT: 80;
            readonly HEAP_CRITICAL_THRESHOLD_PERCENT: 90;
            readonly GC_OPTIMIZATION_ENABLED: true;
            readonly MEMORY_LEAK_DETECTION: true;
        };
        AUTO_OPTIMIZATION: {
            readonly ENABLED: true;
            readonly CACHE_TTL_ADJUSTMENT: true;
            readonly INDEX_CREATION: true;
            readonly MEMORY_CLEANUP: true;
            readonly QUERY_OPTIMIZATION: false;
        };
    };
};
export declare function validateSecurityPolicy(): boolean;
export declare function validatePerformanceConfig(): boolean;
//# sourceMappingURL=security.d.ts.map