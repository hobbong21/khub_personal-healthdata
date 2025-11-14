import { Request } from 'express';
export interface SecurityAuditEvent {
    id: string;
    timestamp: Date;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId?: string;
    sessionId?: string;
    ip: string;
    userAgent: string;
    details: any;
    hash: string;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
}
export interface SecurityMetrics {
    totalEvents: number;
    criticalEvents: number;
    highSeverityEvents: number;
    unresolvedEvents: number;
    topThreats: Array<{
        type: string;
        count: number;
    }>;
    ipAddresses: Array<{
        ip: string;
        eventCount: number;
        severity: string;
    }>;
    timeDistribution: Array<{
        hour: number;
        count: number;
    }>;
}
export declare class SecurityAuditService {
    private static instance;
    private auditEvents;
    private suspiciousIPs;
    static getInstance(): SecurityAuditService;
    recordSecurityEvent(eventType: string, severity: 'low' | 'medium' | 'high' | 'critical', details: any, req?: Request): Promise<void>;
    private trackSuspiciousIP;
    private triggerSecurityAlert;
    getSecurityMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): SecurityMetrics;
    resolveSecurityEvent(eventId: string, resolvedBy: string): Promise<boolean>;
    detectSuspiciousPatterns(): Array<{
        pattern: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        affectedIPs: string[];
        eventCount: number;
    }>;
    getSecurityDashboard(): {
        overview: {
            totalEvents: number;
            criticalAlerts: number;
            activeThreats: number;
            resolvedEvents: number;
        };
        recentEvents: SecurityAuditEvent[];
        suspiciousPatterns: Array<{
            pattern: string;
            description: string;
            severity: string;
            eventCount: number;
        }>;
        topThreats: Array<{
            type: string;
            count: number;
        }>;
        riskScore: number;
    };
    exportSecurityEvents(timeRange: {
        start: Date;
        end: Date;
    }, format?: 'json' | 'csv'): string;
    cleanup(): void;
}
export declare const securityAuditService: SecurityAuditService;
//# sourceMappingURL=securityAuditService.d.ts.map