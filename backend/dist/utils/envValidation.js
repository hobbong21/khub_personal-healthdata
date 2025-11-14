"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironmentVariables = validateEnvironmentVariables;
exports.setDefaultEnvironmentVariables = setDefaultEnvironmentVariables;
exports.generateEnvironmentReport = generateEnvironmentReport;
exports.maskSensitiveEnvVars = maskSensitiveEnvVars;
exports.initializeEnvironment = initializeEnvironment;
const security_1 = require("../config/security");
const REQUIRED_ENV_VARS = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'REDIS_URL'
];
const OPTIONAL_ENV_VARS = [
    'PORT',
    'NODE_ENV',
    'LOG_LEVEL',
    'REDIS_COMPRESSION',
    'PERFORMANCE_MONITORING_ENABLED',
    'AUTO_OPTIMIZATION_ENABLED',
    'SECURITY_ALERT_EMAIL',
    'INTRUSION_DETECTION_ENABLED'
];
function validateEnvironmentVariables() {
    const result = {
        isValid: true,
        errors: [],
        warnings: [],
        missing: [],
        recommendations: []
    };
    for (const envVar of REQUIRED_ENV_VARS) {
        if (!process.env[envVar]) {
            result.missing.push(envVar);
            result.errors.push(`Missing required environment variable: ${envVar}`);
            result.isValid = false;
        }
    }
    if (!(0, security_1.validateSecurityPolicy)()) {
        result.errors.push('Security policy validation failed');
        result.isValid = false;
    }
    if (!(0, security_1.validatePerformanceConfig)()) {
        result.warnings.push('Performance configuration validation failed');
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length < 32) {
        result.errors.push('JWT_SECRET must be at least 32 characters long');
        result.isValid = false;
    }
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (encryptionKey && encryptionKey.length !== 32) {
        result.errors.push('ENCRYPTION_KEY must be exactly 32 characters long');
        result.isValid = false;
    }
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl && !databaseUrl.startsWith('postgresql://')) {
        result.warnings.push('DATABASE_URL should use postgresql:// protocol for PostgreSQL');
    }
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl && !redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
        result.warnings.push('REDIS_URL should use redis:// or rediss:// protocol');
    }
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.SSL_CERT_PATH || !process.env.SSL_KEY_PATH) {
            result.warnings.push('SSL certificates not configured for production environment');
        }
        if (!process.env.SECURITY_ALERT_EMAIL) {
            result.warnings.push('SECURITY_ALERT_EMAIL not configured for production');
        }
        if (!process.env.NODE_OPTIONS?.includes('--max-old-space-size')) {
            result.recommendations.push('Consider setting NODE_OPTIONS="--max-old-space-size=4096" for production');
        }
    }
    if (process.env.NODE_ENV === 'development') {
        result.recommendations.push('Enable detailed logging with LOG_LEVEL=debug for development');
        result.recommendations.push('Consider using nodemon for auto-restart during development');
    }
    return result;
}
function setDefaultEnvironmentVariables() {
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
function generateEnvironmentReport() {
    const validation = validateEnvironmentVariables();
    const configuredVars = [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS]
        .filter(varName => process.env[varName]);
    const missingVars = [...REQUIRED_ENV_VARS, ...OPTIONAL_ENV_VARS]
        .filter(varName => !process.env[varName]);
    let securityLevel = 'high';
    if (validation.errors.length > 0) {
        securityLevel = 'low';
    }
    else if (validation.warnings.length > 2) {
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
function maskSensitiveEnvVars() {
    const sensitiveVars = [
        'JWT_SECRET',
        'ENCRYPTION_KEY',
        'DATABASE_URL',
        'REDIS_URL',
        'OPENAI_API_KEY',
        'AWS_SECRET_ACCESS_KEY',
        'SMTP_PASS'
    ];
    const maskedEnv = {};
    for (const [key, value] of Object.entries(process.env)) {
        if (sensitiveVars.some(sensitive => key.includes(sensitive))) {
            maskedEnv[key] = value ? `${value.substring(0, 4)}****` : 'undefined';
        }
        else {
            maskedEnv[key] = value || 'undefined';
        }
    }
    return maskedEnv;
}
function initializeEnvironment() {
    console.log('🔧 Initializing environment configuration...');
    setDefaultEnvironmentVariables();
    const validation = validateEnvironmentVariables();
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
exports.default = {
    validateEnvironmentVariables,
    setDefaultEnvironmentVariables,
    generateEnvironmentReport,
    maskSensitiveEnvVars,
    initializeEnvironment
};
//# sourceMappingURL=envValidation.js.map