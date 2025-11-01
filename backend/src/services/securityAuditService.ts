import { Request } from 'express';
import prisma from '../config/database';
import { loggingService } from './loggingService';
import { createAuditHash, maskPII } from '../utils/encryption';

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
  topThreats: Array<{ type: string; count: number }>;
  ipAddresses: Array<{ ip: string; eventCount: number; severity: string }>;
  timeDistribution: Array<{ hour: number; count: number }>;
}

export class SecurityAuditService {
  private static instance: SecurityAuditService;
  private auditEvents: SecurityAuditEvent[] = [];
  private suspiciousIPs = new Map<string, { count: number; lastSeen: Date; events: string[] }>();

  static getInstance(): SecurityAuditService {
    if (!SecurityAuditService.instance) {
      SecurityAuditService.instance = new SecurityAuditService();
    }
    return SecurityAuditService.instance;
  }

  /**
   * 보안 이벤트 기록
   */
  async recordSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: any,
    req?: Request
  ): Promise<void> {
    const timestamp = new Date();
    const userId = req?.user?.id;
    const ip = req?.ip || 'unknown';
    const userAgent = req?.get('User-Agent') || 'unknown';
    
    const auditEvent: SecurityAuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      timestamp,
      eventType,
      severity,
      userId,
      sessionId: req?.requestId,
      ip: maskPII(ip),
      userAgent: maskPII(userAgent),
      details,
      hash: createAuditHash(eventType, userId || 'anonymous', timestamp, details),
      resolved: false
    };

    this.auditEvents.push(auditEvent);

    // 의심스러운 IP 추적
    this.trackSuspiciousIP(ip, eventType, severity);

    // 데이터베이스에 저장 (실제 구현)
    try {
      await prisma.auditLog.create({
        data: {
          eventType,
          severity,
          userId,
          ip: maskPII(ip),
          userAgent: maskPII(userAgent),
          details: JSON.stringify(details),
          hash: auditEvent.hash,
          timestamp
        }
      });
    } catch (error) {
      console.error('Failed to save audit event to database:', error);
    }

    // 로깅 서비스에도 기록
    loggingService.security(eventType, severity, details, req);

    // 심각한 이벤트는 즉시 알림
    if (severity === 'critical' || severity === 'high') {
      await this.triggerSecurityAlert(auditEvent);
    }

    // 메모리 관리 (최근 10000개 이벤트만 유지)
    if (this.auditEvents.length > 10000) {
      this.auditEvents.shift();
    }
  }

  /**
   * 의심스러운 IP 추적
   */
  private trackSuspiciousIP(ip: string, eventType: string, severity: string): void {
    const existing = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: new Date(), events: [] };
    
    existing.count++;
    existing.lastSeen = new Date();
    existing.events.push(`${eventType}:${severity}`);
    
    // 최근 100개 이벤트만 유지
    if (existing.events.length > 100) {
      existing.events.shift();
    }
    
    this.suspiciousIPs.set(ip, existing);

    // 임계값 초과 시 자동 차단 고려
    if (existing.count > 50 && severity === 'high') {
      this.recordSecurityEvent(
        'IP_BLOCKED_AUTOMATICALLY',
        'critical',
        { ip, eventCount: existing.count, recentEvents: existing.events.slice(-10) }
      );
    }
  }

  /**
   * 보안 알림 트리거
   */
  private async triggerSecurityAlert(event: SecurityAuditEvent): Promise<void> {
    // 실제 구현에서는 이메일, Slack, SMS 등으로 알림 전송
    console.warn(`🚨 SECURITY ALERT: ${event.eventType} (${event.severity})`);
    console.warn(`Details: ${JSON.stringify(event.details)}`);
    
    // 알림 이력 기록
    await this.recordSecurityEvent(
      'SECURITY_ALERT_SENT',
      'low',
      { originalEvent: event.id, alertType: 'automated' }
    );
  }

  /**
   * 보안 메트릭 조회
   */
  getSecurityMetrics(timeRange?: { start: Date; end: Date }): SecurityMetrics {
    let events = this.auditEvents;
    
    if (timeRange) {
      events = events.filter(
        event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
      );
    }

    // 위협 유형별 집계
    const threatCounts = new Map<string, number>();
    events.forEach(event => {
      threatCounts.set(event.eventType, (threatCounts.get(event.eventType) || 0) + 1);
    });

    // IP별 집계
    const ipCounts = new Map<string, { count: number; maxSeverity: string }>();
    events.forEach(event => {
      const existing = ipCounts.get(event.ip) || { count: 0, maxSeverity: 'low' };
      existing.count++;
      
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      if (severityOrder[event.severity] > severityOrder[existing.maxSeverity as keyof typeof severityOrder]) {
        existing.maxSeverity = event.severity;
      }
      
      ipCounts.set(event.ip, existing);
    });

    // 시간대별 집계
    const hourlyDistribution = new Map<number, number>();
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

  /**
   * 보안 이벤트 해결 처리
   */
  async resolveSecurityEvent(eventId: string, resolvedBy: string): Promise<boolean> {
    const event = this.auditEvents.find(e => e.id === eventId);
    if (!event) {
      return false;
    }

    event.resolved = true;
    event.resolvedAt = new Date();
    event.resolvedBy = resolvedBy;

    // 데이터베이스 업데이트
    try {
      await prisma.auditLog.updateMany({
        where: { hash: event.hash },
        data: {
          resolved: true,
          resolvedAt: event.resolvedAt,
          resolvedBy
        }
      });
    } catch (error) {
      console.error('Failed to update audit event resolution:', error);
      return false;
    }

    await this.recordSecurityEvent(
      'SECURITY_EVENT_RESOLVED',
      'low',
      { originalEventId: eventId, resolvedBy }
    );

    return true;
  }

  /**
   * 의심스러운 활동 패턴 감지
   */
  detectSuspiciousPatterns(): Array<{
    pattern: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedIPs: string[];
    eventCount: number;
  }> {
    const patterns: Array<{
      pattern: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      affectedIPs: string[];
      eventCount: number;
    }> = [];

    // 패턴 1: 단시간 내 다수 실패한 로그인 시도
    const recentEvents = this.auditEvents.filter(
      e => e.timestamp > new Date(Date.now() - 15 * 60 * 1000) // 최근 15분
    );

    const loginFailures = recentEvents.filter(e => 
      e.eventType.includes('LOGIN_FAILED') || e.eventType.includes('AUTHENTICATION_FAILED')
    );

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

    // 패턴 2: 비정상적인 데이터 접근 패턴
    const dataAccessEvents = recentEvents.filter(e => 
      e.eventType.includes('DATA_ACCESS') || e.eventType.includes('UNAUTHORIZED_ACCESS')
    );

    const ipAccessCounts = new Map<string, number>();
    dataAccessEvents.forEach(e => {
      ipAccessCounts.set(e.ip, (ipAccessCounts.get(e.ip) || 0) + 1);
    });

    ipAccessCounts.forEach((count, ip) => {
      if (count > 100) { // 15분에 100회 이상 데이터 접근
        patterns.push({
          pattern: 'EXCESSIVE_DATA_ACCESS',
          description: '비정상적으로 많은 데이터 접근 시도가 감지되었습니다.',
          severity: 'medium',
          affectedIPs: [ip],
          eventCount: count
        });
      }
    });

    // 패턴 3: 권한 상승 시도
    const privilegeEscalation = recentEvents.filter(e => 
      e.eventType.includes('PRIVILEGE') || e.eventType.includes('PERMISSION_DENIED')
    );

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

  /**
   * 보안 대시보드 데이터 생성
   */
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
    topThreats: Array<{ type: string; count: number }>;
    riskScore: number;
  } {
    const recentEvents = this.auditEvents
      .filter(e => e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    const metrics = this.getSecurityMetrics();
    const patterns = this.detectSuspiciousPatterns();

    // 위험도 점수 계산 (0-100)
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

  /**
   * 보안 이벤트 내보내기
   */
  exportSecurityEvents(
    timeRange: { start: Date; end: Date },
    format: 'json' | 'csv' = 'json'
  ): string {
    const events = this.auditEvents.filter(
      e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
    );

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

  /**
   * 정리 작업
   */
  cleanup(): void {
    // 30일 이상 된 해결된 이벤트 제거
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.auditEvents = this.auditEvents.filter(
      event => !event.resolved || event.timestamp > cutoffDate
    );

    // 의심스러운 IP 목록 정리 (7일 이상 활동 없음)
    const ipCutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (data.lastSeen < ipCutoffDate) {
        this.suspiciousIPs.delete(ip);
      }
    }

    console.log('Security audit data cleanup completed');
  }
}

// 싱글톤 인스턴스 내보내기
export const securityAuditService = SecurityAuditService.getInstance();