"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogModel = void 0;
const database_1 = __importDefault(require("../config/database"));
const encryption_1 = require("../utils/encryption");
class AuditLogModel {
    static async create(logData) {
        const hash = (0, encryption_1.createAuditHash)(logData.action, logData.userId || 'anonymous', logData.timestamp, logData.details);
        const auditLog = await database_1.default.auditLog.create({
            data: {
                timestamp: logData.timestamp,
                action: logData.action,
                userId: logData.userId,
                ip: logData.ip,
                userAgent: logData.userAgent,
                path: logData.path,
                method: logData.method,
                details: logData.details ? JSON.stringify(logData.details) : null,
                hash
            }
        });
        return {
            ...auditLog,
            details: auditLog.details ? JSON.parse(auditLog.details) : null
        };
    }
    static async findMany(query) {
        const where = {};
        if (query.userId) {
            where.userId = query.userId;
        }
        if (query.action) {
            where.action = query.action;
        }
        if (query.startDate || query.endDate) {
            where.timestamp = {};
            if (query.startDate) {
                where.timestamp.gte = query.startDate;
            }
            if (query.endDate) {
                where.timestamp.lte = query.endDate;
            }
        }
        const auditLogs = await database_1.default.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: query.limit || 100,
            skip: query.offset || 0
        });
        return auditLogs.map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details) : null
        }));
    }
    static async findByUserId(userId, limit = 50) {
        return this.findMany({ userId, limit });
    }
    static async findByAction(action, limit = 50) {
        return this.findMany({ action, limit });
    }
    static async findSecurityEvents(startDate, endDate) {
        const securityActions = [
            'LOGIN_FAILED',
            'PERMISSION_DENIED',
            'UNAUTHORIZED_ACCESS_ATTEMPT',
            'DATA_OWNERSHIP_VIOLATION',
            'RATE_LIMIT_EXCEEDED',
            'IP_WHITELIST_VIOLATION',
            'SESSION_TIMEOUT',
            'MALICIOUS_INPUT_DETECTED'
        ];
        const where = {
            action: {
                in: securityActions
            }
        };
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) {
                where.timestamp.gte = startDate;
            }
            if (endDate) {
                where.timestamp.lte = endDate;
            }
        }
        const auditLogs = await database_1.default.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: 200
        });
        return auditLogs.map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details) : null
        }));
    }
    static async findDataAccessLogs(userId, dataType) {
        const where = {
            action: {
                in: ['SENSITIVE_DATA_ACCESS', 'DATA_READ', 'DATA_WRITE', 'DATA_DELETE']
            }
        };
        if (userId) {
            where.userId = userId;
        }
        if (dataType) {
            where.details = {
                contains: dataType
            };
        }
        const auditLogs = await database_1.default.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        return auditLogs.map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details) : null
        }));
    }
    static async getStatistics(startDate, endDate) {
        const where = {};
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) {
                where.timestamp.gte = startDate;
            }
            if (endDate) {
                where.timestamp.lte = endDate;
            }
        }
        const totalLogs = await database_1.default.auditLog.count({ where });
        const securityEvents = await database_1.default.auditLog.count({
            where: {
                ...where,
                action: {
                    in: [
                        'LOGIN_FAILED',
                        'PERMISSION_DENIED',
                        'UNAUTHORIZED_ACCESS_ATTEMPT',
                        'DATA_OWNERSHIP_VIOLATION',
                        'RATE_LIMIT_EXCEEDED'
                    ]
                }
            }
        });
        const dataAccess = await database_1.default.auditLog.count({
            where: {
                ...where,
                action: {
                    in: ['SENSITIVE_DATA_ACCESS', 'DATA_READ', 'DATA_WRITE']
                }
            }
        });
        const uniqueUsersResult = await database_1.default.auditLog.findMany({
            where: {
                ...where,
                userId: { not: null }
            },
            select: { userId: true },
            distinct: ['userId']
        });
        const uniqueUsers = uniqueUsersResult.length;
        const topActionsResult = await database_1.default.auditLog.groupBy({
            by: ['action'],
            where,
            _count: { action: true },
            orderBy: { _count: { action: 'desc' } },
            take: 10
        });
        const topActions = topActionsResult.map(item => ({
            action: item.action,
            count: item._count.action
        }));
        return {
            totalLogs,
            securityEvents,
            dataAccess,
            uniqueUsers,
            topActions
        };
    }
    static async verifyIntegrity(logId) {
        const log = await database_1.default.auditLog.findUnique({
            where: { id: logId }
        });
        if (!log) {
            return false;
        }
        const expectedHash = (0, encryption_1.createAuditHash)(log.action, log.userId || 'anonymous', log.timestamp, log.details ? JSON.parse(log.details) : null);
        return log.hash === expectedHash;
    }
    static async cleanup(retentionDays = 2555) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        const result = await database_1.default.auditLog.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffDate
                }
            }
        });
        return result.count;
    }
    static async exportLogs(startDate, endDate, format = 'json') {
        const logs = await this.findMany({
            startDate,
            endDate,
            limit: 10000
        });
        if (format === 'csv') {
            const headers = ['timestamp', 'action', 'userId', 'ip', 'path', 'method', 'details', 'hash'];
            const csvRows = logs.map(log => [
                log.timestamp.toISOString(),
                log.action,
                log.userId || '',
                log.ip,
                log.path,
                log.method,
                log.details ? JSON.stringify(log.details) : '',
                log.hash
            ]);
            return [headers, ...csvRows].map(row => row.join(',')).join('\n');
        }
        return JSON.stringify(logs, null, 2);
    }
}
exports.AuditLogModel = AuditLogModel;
//# sourceMappingURL=AuditLog.js.map