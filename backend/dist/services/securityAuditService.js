"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityAuditService = exports.SecurityAuditService = void 0;
const database_1 = __importDefault(require("../config/database"));
const loggingService_1 = require("./loggingService");
const encryption_1 = require("../utils/encryption");
class SecurityAuditService {
    constructor() {
        this.auditEvents = [];
        this.suspiciousIPs = new Map();
    }
    static getInstance() {
        if (!SecurityAuditService.instance) {
            SecurityAuditService.instance = new SecurityAuditService();
        }
        return SecurityAuditService.instance;
    }
    async recordSecurityEvent(eventType, severity, details, req) {
        const timestamp = new Date();
        const userId = req?.user?.id;
        const ip = req?.ip || 'unknown';
        const userAgent = req?.get('User-Agent') || 'unknown';
        const auditEvent = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            timestamp,
            eventType,
            severity,
            userId,
            sessionId: req?.requestId,
            ip: (0, encryption_1.maskPII)(ip),
            userAgent: (0, encryption_1.maskPII)(userAgent),
            details,
            hash: (0, encryption_1.createAuditHash)(eventType, userId || 'anonymous', timestamp, details),
            resolved: false
        };
        this.auditEvents.push(auditEvent);
        this.trackSuspiciousIP(ip, eventType, severity);
        try {
            await database_1.default.auditLog.create({
                data: {
                    eventType,
                    severity,
                    userId,
                    ip: (0, encryption_1.maskPII)(ip),
                    userAgent: (0, encryption_1.maskPII)(userAgent),
                    details: JSON.stringify(details),
                    hash: auditEvent.hash,
                    timestamp
                }
            });
        }
        catch (error) {
            console.error('Failed to save audit event to database:', error);
        }
        loggingService_1.loggingService.security(eventType, severity, details, req);
        if (severity === 'critical' || severity === 'high') {
            await this.triggerSecurityAlert(auditEvent);
        }
        if (this.auditEvents.length > 10000) {
            this.auditEvents.shift();
        }
    }
    trackSuspiciousIP(ip, eventType, severity) {
        const existing = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: new Date(), events: [] };
        existing.count++;
        existing.lastSeen = new Date();
        existing.events.push(`${eventType}:${severity}`);
        if (existing.events.length > 100) {
            existing.events.shift();
        }
        this.suspiciousIPs.set(ip, existing);
        if (existing.count > 50 && severity === 'high') {
            this.recordSecurityEvent('IP_BLOCKED_AUTOMATICALLY', 'critical', { ip, eventCount: existing.count, recentEvents: existing.events.slice(-10) });
        }
    }
    async triggerSecurityAlert(event) {
        console.warn(`🚨 SECURITY ALERT: ${event.eventType} (${event.severity})`);
        console.warn(`Details: ${JSON.stringify(event.details)}`);
        await this.recordSecurityEvent('SECURITY_ALERT_SENT', 'low', { originalEvent: event.id, alertType: 'automated' });
    }
    getSecurityMetrics(timeRange) {
        let events = this.auditEvents;
        if (timeRange) {
            events = events.filter(event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end);
        }
        const threatCounts = new Map();
        events.forEach(event => {
            threatCounts.set(event.eventType, (threatCounts.get(event.eventType) || 0) + 1);
        });
        const ipCounts = new Map();
        events.forEach(event => {
            const existing = ipCounts.get(event.ip) || { count: 0, maxSeverity: 'low' };
            existing.count++;
            const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
            if (severityOrder[event.severity] > severityOrder[existing.maxSeverity]) {
                existing.maxSeverity = event.severity;
            }
            ipCounts.set(event.ip, existing);
        });
        const hourlyDistribution = new Map();
        events.forEach(event => {
            const hour = event.timestamp.getHours();
            hourlyDistribution.set(hour, (hourlyDistribution.get(hour) || 0) + 1);
        });
        return {
            totalEvents: events.length,
            criticalEvents: events.filter(e => e.severity === 'critical').length,
            highSeverityEvents: events.filter(e => e.severity === 'high').length,
            unresolvedEvents: events.filter(e => !e.resolved).length,
            topThreats: Array.from(threatCounts.entries())
                .map(([type, count]) => ({ type, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10),
            ipAddresses: Array.from(ipCounts.entries())
                .map(([ip, data]) => ({ ip, eventCount: data.count, severity: data.maxSeverity }))
                .sort((a, b) => b.eventCount - a.eventCount)
                .slice(0, 20),
            timeDistribution: Array.from(hourlyDistribution.entries())
                .map(([hour, count]) => ({ hour, count }))
                .sort((a, b) => a.hour - b.hour)
        };
    }
    async resolveSecurityEvent(eventId, resolvedBy) {
        const event = this.auditEvents.find(e => e.id === eventId);
        if (!event) {
            return false;
        }
        event.resolved = true;
        event.resolvedAt = new Date();
        event.resolvedBy = resolvedBy;
        try {
            await database_1.default.auditLog.updateMany({
                where: { hash: event.hash },
                data: {
                    resolved: true,
                    resolvedAt: event.resolvedAt,
                    resolvedBy
                }
            });
        }
        catch (error) {
            console.error('Failed to update audit event resolution:', error);
            return false;
        }
        await this.recordSecurityEvent('SECURITY_EVENT_RESOLVED', 'low', { originalEventId: eventId, resolvedBy });
        return true;
    }
    detectSuspiciousPatterns() {
        const patterns = [];
        const recentEvents = this.auditEvents.filter(e => e.timestamp > new Date(Date.now() - 15 * 60 * 1000));
        const loginFailures = recentEvents.filter(e => e.eventType.includes('LOGIN_FAILED') || e.eventType.includes('AUTHENTICATION_FAILED'));
        if (loginFailures.length > 20) {
            const affectedIPs = [...new Set(loginFailures.map(e => e.ip))];
            patterns.push({
                pattern: 'BRUTE_FORCE_ATTACK',
                description: '단시간 내 다수의 로그인 실패 시도가 감지되었습니다.',
                severity: 'high',
                affectedIPs,
                eventCount: loginFailures.length
            });
        }
        const dataAccessEvents = recentEvents.filter(e => e.eventType.includes('DATA_ACCESS') || e.eventType.includes('UNAUTHORIZED_ACCESS'));
        const ipAccessCounts = new Map();
        dataAccessEvents.forEach(e => {
            ipAccessCounts.set(e.ip, (ipAccessCounts.get(e.ip) || 0) + 1);
        });
        ipAccessCounts.forEach((count, ip) => {
            if (count > 100) {
                patterns.push({
                    pattern: 'EXCESSIVE_DATA_ACCESS',
                    description: '비정상적으로 많은 데이터 접근 시도가 감지되었습니다.',
                    severity: 'medium',
                    affectedIPs: [ip],
                    eventCount: count
                });
            }
        });
        const privilegeEscalation = recentEvents.filter(e => e.eventType.includes('PRIVILEGE') || e.eventType.includes('PERMISSION_DENIED'));
        if (privilegeEscalation.length > 10) {
            const affectedIPs = [...new Set(privilegeEscalation.map(e => e.ip))];
            patterns.push({
                pattern: 'PRIVILEGE_ESCALATION_ATTEMPT',
                description: '권한 상승 시도가 감지되었습니다.',
                severity: 'high',
                affectedIPs,
                eventCount: privilegeEscalation.length
            });
        }
        return patterns;
    }
    getSecurityDashboard() {
        const recentEvents = this.auditEvents
            .filter(e => e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 50);
        const metrics = this.getSecurityMetrics();
        const patterns = this.detectSuspiciousPatterns();
        let riskScore = 0;
        riskScore += metrics.criticalEvents * 10;
        riskScore += metrics.highSeverityEvents * 5;
        riskScore += patterns.filter(p => p.severity === 'critical').length * 15;
        riskScore += patterns.filter(p => p.severity === 'high').length * 10;
        riskScore = Math.min(riskScore, 100);
        return {
            overview: {
                totalEvents: metrics.totalEvents,
                criticalAlerts: metrics.criticalEvents,
                activeThreats: patterns.length,
                resolvedEvents: this.auditEvents.filter(e => e.resolved).length
            },
            recentEvents: recentEvents.slice(0, 10),
            suspiciousPatterns: patterns,
            topThreats: metrics.topThreats,
            riskScore
        };
    }
    exportSecurityEvents(timeRange, format = 'json') {
        const events = this.auditEvents.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end);
        if (format === 'csv') {
            const headers = ['Timestamp', 'Event Type', 'Severity', 'User ID', 'IP', 'Details'];
            const rows = events.map(e => [
                e.timestamp.toISOString(),
                e.eventType,
                e.severity,
                e.userId || 'N/A',
                e.ip,
                JSON.stringify(e.details)
            ]);
            return [headers, ...rows].map(row => row.join(',')).join('\n');
        }
        return JSON.stringify(events, null, 2);
    }
    cleanup() {
        const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        this.auditEvents = this.auditEvents.filter(event => !event.resolved || event.timestamp > cutoffDate);
        const ipCutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        for (const [ip, data] of this.suspiciousIPs.entries()) {
            if (data.lastSeen < ipCutoffDate) {
                this.suspiciousIPs.delete(ip);
            }
        }
        console.log('Security audit data cleanup completed');
    }
}
exports.SecurityAuditService = SecurityAuditService;
exports.securityAuditService = SecurityAuditService.getInstance();
//# sourceMappingURL=securityAuditService.js.map