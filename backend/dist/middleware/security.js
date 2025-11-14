"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sensitiveDataRateLimit = exports.authRateLimit = exports.generalRateLimit = exports.createRateLimit = exports.securityHeaders = exports.Permission = exports.UserRole = void 0;
exports.requirePermission = requirePermission;
exports.requireDataOwnership = requireDataOwnership;
exports.auditLog = auditLog;
exports.logSensitiveDataAccess = logSensitiveDataAccess;
exports.requireWhitelistedIP = requireWhitelistedIP;
exports.checkSessionTimeout = checkSessionTimeout;
exports.validateDataIntegrity = validateDataIntegrity;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const encryption_1 = require("../utils/encryption");
const database_1 = __importDefault(require("../config/database"));
var UserRole;
(function (UserRole) {
    UserRole["PATIENT"] = "patient";
    UserRole["HEALTHCARE_PROVIDER"] = "healthcare_provider";
    UserRole["RESEARCHER"] = "researcher";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var Permission;
(function (Permission) {
    Permission["READ_OWN_DATA"] = "read_own_data";
    Permission["WRITE_OWN_DATA"] = "write_own_data";
    Permission["READ_PATIENT_DATA"] = "read_patient_data";
    Permission["WRITE_PATIENT_DATA"] = "write_patient_data";
    Permission["ACCESS_ANONYMIZED_DATA"] = "access_anonymized_data";
    Permission["MANAGE_USERS"] = "manage_users";
    Permission["SYSTEM_ADMIN"] = "system_admin";
})(Permission || (exports.Permission = Permission = {}));
const ROLE_PERMISSIONS = {
    [UserRole.PATIENT]: [
        Permission.READ_OWN_DATA,
        Permission.WRITE_OWN_DATA
    ],
    [UserRole.HEALTHCARE_PROVIDER]: [
        Permission.READ_OWN_DATA,
        Permission.WRITE_OWN_DATA,
        Permission.READ_PATIENT_DATA,
        Permission.WRITE_PATIENT_DATA
    ],
    [UserRole.RESEARCHER]: [
        Permission.READ_OWN_DATA,
        Permission.WRITE_OWN_DATA,
        Permission.ACCESS_ANONYMIZED_DATA
    ],
    [UserRole.ADMIN]: [
        Permission.READ_OWN_DATA,
        Permission.WRITE_OWN_DATA,
        Permission.READ_PATIENT_DATA,
        Permission.WRITE_PATIENT_DATA,
        Permission.ACCESS_ANONYMIZED_DATA,
        Permission.MANAGE_USERS,
        Permission.SYSTEM_ADMIN
    ]
};
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});
const createRateLimit = (windowMs, max, message) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: message || '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            auditLog(req, 'RATE_LIMIT_EXCEEDED', { ip: req.ip });
            res.status(429).json({
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
                }
            });
        }
    });
};
exports.createRateLimit = createRateLimit;
exports.generalRateLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 100);
exports.authRateLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 5);
exports.sensitiveDataRateLimit = (0, exports.createRateLimit)(15 * 60 * 1000, 50);
function requirePermission(permission) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                auditLog(req, 'UNAUTHORIZED_ACCESS_ATTEMPT', { permission });
                res.status(401).json({
                    error: {
                        code: 'AUTHENTICATION_REQUIRED',
                        message: '인증이 필요합니다'
                    }
                });
                return;
            }
            const userRole = UserRole.PATIENT;
            const userPermissions = ROLE_PERMISSIONS[userRole];
            if (!userPermissions.includes(permission)) {
                auditLog(req, 'PERMISSION_DENIED', {
                    userId: req.user.id,
                    permission,
                    userRole
                });
                res.status(403).json({
                    error: {
                        code: 'INSUFFICIENT_PERMISSIONS',
                        message: '이 작업을 수행할 권한이 없습니다'
                    }
                });
                return;
            }
            auditLog(req, 'PERMISSION_GRANTED', {
                userId: req.user.id,
                permission,
                userRole
            });
            next();
        }
        catch (error) {
            auditLog(req, 'PERMISSION_CHECK_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({
                error: {
                    code: 'PERMISSION_CHECK_FAILED',
                    message: '권한 확인 중 오류가 발생했습니다'
                }
            });
        }
    };
}
function requireDataOwnership(resourceIdParam = 'id') {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    error: {
                        code: 'AUTHENTICATION_REQUIRED',
                        message: '인증이 필요합니다'
                    }
                });
                return;
            }
            const resourceId = req.params[resourceIdParam];
            const userId = req.user.id;
            const isOwner = await verifyResourceOwnership(resourceId, userId);
            if (!isOwner) {
                auditLog(req, 'DATA_OWNERSHIP_VIOLATION', {
                    userId,
                    resourceId,
                    resourceType: req.route?.path
                });
                res.status(403).json({
                    error: {
                        code: 'ACCESS_DENIED',
                        message: '해당 데이터에 접근할 권한이 없습니다'
                    }
                });
                return;
            }
            next();
        }
        catch (error) {
            auditLog(req, 'OWNERSHIP_CHECK_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
            res.status(500).json({
                error: {
                    code: 'OWNERSHIP_CHECK_FAILED',
                    message: '데이터 소유권 확인 중 오류가 발생했습니다'
                }
            });
        }
    };
}
async function verifyResourceOwnership(resourceId, userId) {
    try {
        const healthRecord = await database_1.default.healthRecord.findFirst({
            where: { id: resourceId, userId },
            select: { id: true }
        });
        if (healthRecord)
            return true;
        const medicalRecord = await database_1.default.medicalRecord.findFirst({
            where: { id: resourceId, userId },
            select: { id: true }
        });
        if (medicalRecord)
            return true;
        const medication = await database_1.default.medication.findFirst({
            where: { id: resourceId, userId },
            select: { id: true }
        });
        if (medication)
            return true;
        const genomicData = await database_1.default.genomicData.findFirst({
            where: { id: resourceId, userId },
            select: { id: true }
        });
        if (genomicData)
            return true;
        return false;
    }
    catch (error) {
        console.error('Resource ownership verification error:', error);
        return false;
    }
}
function auditLog(req, action, details) {
    try {
        const timestamp = new Date();
        const userId = req.user?.id || 'anonymous';
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        const auditData = {
            timestamp: timestamp.toISOString(),
            action,
            userId: req.user ? (0, encryption_1.maskPII)(userId) : 'anonymous',
            ip: (0, encryption_1.maskPII)(ip),
            userAgent: (0, encryption_1.maskPII)(userAgent),
            path: req.path,
            method: req.method,
            details: details ? JSON.stringify(details) : null
        };
        const auditHash = (0, encryption_1.createAuditHash)(action, userId, timestamp, details);
        console.log(`[AUDIT] ${JSON.stringify({ ...auditData, hash: auditHash })}`);
    }
    catch (error) {
        console.error('Audit logging error:', error);
    }
}
function logSensitiveDataAccess(dataType) {
    return (req, res, next) => {
        auditLog(req, 'SENSITIVE_DATA_ACCESS', {
            dataType,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });
        next();
    };
}
function requireWhitelistedIP(allowedIPs) {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress;
        if (!clientIP || !allowedIPs.includes(clientIP)) {
            auditLog(req, 'IP_WHITELIST_VIOLATION', {
                clientIP: (0, encryption_1.maskPII)(clientIP || 'unknown'),
                allowedIPs: allowedIPs.length
            });
            res.status(403).json({
                error: {
                    code: 'IP_NOT_ALLOWED',
                    message: '허용되지 않은 IP 주소입니다'
                }
            });
            return;
        }
        next();
    };
}
function checkSessionTimeout(timeoutMinutes = 30) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                const now = Math.floor(Date.now() / 1000);
                if (payload.exp && payload.exp < now) {
                    auditLog(req, 'TOKEN_EXPIRED', {
                        userId: req.user?.id,
                        expiredAt: new Date(payload.exp * 1000).toISOString()
                    });
                    res.status(401).json({
                        error: {
                            code: 'TOKEN_EXPIRED',
                            message: '토큰이 만료되었습니다. 다시 로그인해주세요.'
                        }
                    });
                    return;
                }
            }
            catch (error) {
            }
        }
        next();
    };
}
function validateDataIntegrity() {
    return (req, res, next) => {
        if (req.body && Object.keys(req.body).length > 0) {
            try {
                const bodyString = JSON.stringify(req.body);
                const suspiciousPatterns = [
                    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                    /javascript:/gi,
                    /on\w+\s*=/gi,
                    /eval\s*\(/gi,
                    /expression\s*\(/gi
                ];
                for (const pattern of suspiciousPatterns) {
                    if (pattern.test(bodyString)) {
                        auditLog(req, 'MALICIOUS_INPUT_DETECTED', {
                            pattern: pattern.source,
                            userId: req.user?.id
                        });
                        res.status(400).json({
                            error: {
                                code: 'INVALID_INPUT',
                                message: '유효하지 않은 입력 데이터입니다'
                            }
                        });
                        return;
                    }
                }
            }
            catch (error) {
                auditLog(req, 'DATA_VALIDATION_ERROR', {
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        next();
    };
}
//# sourceMappingURL=security.js.map