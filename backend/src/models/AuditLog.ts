import prisma from '../config/database';
import { createAuditHash } from '../utils/encryption';

export interface AuditLogEntry {
  id?: string;
  timestamp: Date;
  action: string;
  userId?: string;
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  details?: any;
  hash: string;
  createdAt?: Date;
}

export interface AuditLogQuery {
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AuditLogModel {
  /**
   * 감사 로그 생성
   */
  static async create(logData: Omit<AuditLogEntry, 'id' | 'createdAt' | 'hash'>): Promise<AuditLogEntry> {
    const hash = createAuditHash(
      logData.action,
      logData.userId || 'anonymous',
      logData.timestamp,
      logData.details
    );

    const auditLog = await prisma.auditLog.create({
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

  /**
   * 감사 로그 조회
   */
  static async findMany(query: AuditLogQuery): Promise<AuditLogEntry[]> {
    const where: any = {};

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

    const auditLogs = await prisma.auditLog.findMany({
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

  /**
   * 특정 사용자의 감사 로그 조회
   */
  static async findByUserId(userId: string, limit: number = 50): Promise<AuditLogEntry[]> {
    return this.findMany({ userId, limit });
  }

  /**
   * 특정 액션의 감사 로그 조회
   */
  static async findByAction(action: string, limit: number = 50): Promise<AuditLogEntry[]> {
    return this.findMany({ action, limit });
  }

  /**
   * 보안 이벤트 조회 (로그인 실패, 권한 위반 등)
   */
  static async findSecurityEvents(startDate?: Date, endDate?: Date): Promise<AuditLogEntry[]> {
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

    const where: any = {
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

    const auditLogs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 200
    });

    return auditLogs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
  }

  /**
   * 데이터 접근 로그 조회
   */
  static async findDataAccessLogs(userId?: string, dataType?: string): Promise<AuditLogEntry[]> {
    const where: any = {
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

    const auditLogs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    return auditLogs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null
    }));
  }

  /**
   * 감사 로그 통계
   */
  static async getStatistics(startDate?: Date, endDate?: Date): Promise<{
    totalLogs: number;
    securityEvents: number;
    dataAccess: number;
    uniqueUsers: number;
    topActions: Array<{ action: string; count: number }>;
  }> {
    const where: any = {};

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = startDate;
      }
      if (endDate) {
        where.timestamp.lte = endDate;
      }
    }

    // 총 로그 수
    const totalLogs = await prisma.auditLog.count({ where });

    // 보안 이벤트 수
    const securityEvents = await prisma.auditLog.count({
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

    // 데이터 접근 로그 수
    const dataAccess = await prisma.auditLog.count({
      where: {
        ...where,
        action: {
          in: ['SENSITIVE_DATA_ACCESS', 'DATA_READ', 'DATA_WRITE']
        }
      }
    });

    // 고유 사용자 수
    const uniqueUsersResult = await prisma.auditLog.findMany({
      where: {
        ...where,
        userId: { not: null }
      },
      select: { userId: true },
      distinct: ['userId']
    });
    const uniqueUsers = uniqueUsersResult.length;

    // 상위 액션
    const topActionsResult = await prisma.auditLog.groupBy({
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

  /**
   * 감사 로그 무결성 검증
   */
  static async verifyIntegrity(logId: string): Promise<boolean> {
    const log = await prisma.auditLog.findUnique({
      where: { id: logId }
    });

    if (!log) {
      return false;
    }

    const expectedHash = createAuditHash(
      log.action,
      log.userId || 'anonymous',
      log.timestamp,
      log.details ? JSON.parse(log.details) : null
    );

    return log.hash === expectedHash;
  }

  /**
   * 오래된 감사 로그 정리 (데이터 보존 정책에 따라)
   */
  static async cleanup(retentionDays: number = 2555): Promise<number> { // 7년 보존
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
  }

  /**
   * 감사 로그 내보내기 (규정 준수용)
   */
  static async exportLogs(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const logs = await this.findMany({
      startDate,
      endDate,
      limit: 10000 // 대량 내보내기 시 제한
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