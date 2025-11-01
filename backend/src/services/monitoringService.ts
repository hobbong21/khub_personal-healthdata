import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';
import prisma from '../config/database';
import { redisService } from '../config/redis';

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    free: number;
    total: number;
    percentage: number;
  };
  database: {
    activeConnections: number;
    queryCount: number;
    avgQueryTime: number;
  };
  cache: {
    hitRate: number;
    keyCount: number;
    memoryUsage: string;
  };
  api: {
    requestCount: number;
    avgResponseTime: number;
    errorRate: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // seconds
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'resolved' | 'acknowledged';
}

export interface UserBehaviorEvent {
  userId: string;
  sessionId: string;
  event: string;
  page: string;
  timestamp: Date;
  metadata?: any;
  userAgent?: string;
  ip?: string;
}

export class MonitoringService extends EventEmitter {
  private static instance: MonitoringService;
  private metrics: SystemMetrics[] = [];
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = [];
  private userBehaviorEvents: UserBehaviorEvent[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  // API 메트릭 추적
  private apiMetrics = {
    requestCount: 0,
    totalResponseTime: 0,
    errorCount: 0,
    requestTimes: [] as number[]
  };

  constructor() {
    super();
    this.initializeDefaultAlertRules();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * 모니터링 시작
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.isMonitoring) {
      console.log('Monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    console.log(`Starting system monitoring with ${intervalMs}ms interval`);

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectSystemMetrics();
        this.metrics.push(metrics);
        
        // 최근 100개 메트릭만 유지
        if (this.metrics.length > 100) {
          this.metrics.shift();
        }

        // 알림 규칙 확인
        await this.checkAlertRules(metrics);

        // 메트릭 이벤트 발생
        this.emit('metrics', metrics);
      } catch (error) {
        console.error('Error collecting system metrics:', error);
      }
    }, intervalMs);
  }

  /**
   * 모니터링 중지
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('System monitoring stopped');
  }

  /**
   * 시스템 메트릭 수집
   */
  private async collectSystemMetrics(): Promise<SystemMetrics> {
    const timestamp = new Date();

    // CPU 및 메모리 정보
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // 데이터베이스 메트릭
    const dbMetrics = await this.collectDatabaseMetrics();

    // 캐시 메트릭
    const cacheMetrics = await this.collectCacheMetrics();

    // API 메트릭
    const apiMetrics = this.collectAPIMetrics();

    return {
      timestamp,
      cpu: {
        usage: (cpuUsage.user + cpuUsage.system) / 1000000, // microseconds to seconds
        loadAverage: process.platform === 'linux' ? require('os').loadavg() : [0, 0, 0]
      },
      memory: {
        used: memoryUsage.heapUsed,
        free: memoryUsage.heapTotal - memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      },
      database: dbMetrics,
      cache: cacheMetrics,
      api: apiMetrics
    };
  }

  /**
   * 데이터베이스 메트릭 수집
   */
  private async collectDatabaseMetrics(): Promise<{
    activeConnections: number;
    queryCount: number;
    avgQueryTime: number;
  }> {
    try {
      const connectionResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'
      `;

      const statsResult = await prisma.$queryRaw<Array<{
        calls: bigint;
        mean_exec_time: number;
      }>>`
        SELECT 
          sum(calls) as calls,
          avg(mean_exec_time) as mean_exec_time
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat%'
      `;

      return {
        activeConnections: Number(connectionResult[0]?.count || 0),
        queryCount: Number(statsResult[0]?.calls || 0),
        avgQueryTime: Number(statsResult[0]?.mean_exec_time || 0)
      };
    } catch (error) {
      console.error('Failed to collect database metrics:', error);
      return {
        activeConnections: 0,
        queryCount: 0,
        avgQueryTime: 0
      };
    }
  }

  /**
   * 캐시 메트릭 수집
   */
  private async collectCacheMetrics(): Promise<{
    hitRate: number;
    keyCount: number;
    memoryUsage: string;
  }> {
    try {
      const stats = await redisService.getCacheStats();
      return stats;
    } catch (error) {
      console.error('Failed to collect cache metrics:', error);
      return {
        hitRate: 0,
        keyCount: 0,
        memoryUsage: '0B'
      };
    }
  }

  /**
   * API 메트릭 수집
   */
  private collectAPIMetrics(): {
    requestCount: number;
    avgResponseTime: number;
    errorRate: number;
  } {
    const { requestCount, totalResponseTime, errorCount, requestTimes } = this.apiMetrics;
    
    const avgResponseTime = requestCount > 0 ? totalResponseTime / requestCount : 0;
    const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;

    return {
      requestCount,
      avgResponseTime,
      errorRate
    };
  }

  /**
   * API 요청 추적
   */
  trackAPIRequest(responseTime: number, isError: boolean = false): void {
    this.apiMetrics.requestCount++;
    this.apiMetrics.totalResponseTime += responseTime;
    this.apiMetrics.requestTimes.push(responseTime);
    
    if (isError) {
      this.apiMetrics.errorCount++;
    }

    // 최근 1000개 요청 시간만 유지
    if (this.apiMetrics.requestTimes.length > 1000) {
      this.apiMetrics.requestTimes.shift();
    }
  }

  /**
   * 사용자 행동 추적
   */
  trackUserBehavior(event: Omit<UserBehaviorEvent, 'timestamp'>): void {
    const behaviorEvent: UserBehaviorEvent = {
      ...event,
      timestamp: new Date()
    };

    this.userBehaviorEvents.push(behaviorEvent);

    // 최근 10000개 이벤트만 유지
    if (this.userBehaviorEvents.length > 10000) {
      this.userBehaviorEvents.shift();
    }

    // 이벤트 발생
    this.emit('userBehavior', behaviorEvent);
  }

  /**
   * 기본 알림 규칙 초기화
   */
  private initializeDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-memory-usage',
        name: '높은 메모리 사용률',
        metric: 'memory.percentage',
        operator: 'gt',
        threshold: 85,
        duration: 300, // 5분
        severity: 'high',
        enabled: true,
        notificationChannels: ['email', 'slack']
      },
      {
        id: 'high-response-time',
        name: '높은 API 응답 시간',
        metric: 'api.avgResponseTime',
        operator: 'gt',
        threshold: 1000, // 1초
        duration: 180, // 3분
        severity: 'medium',
        enabled: true,
        notificationChannels: ['slack']
      },
      {
        id: 'high-error-rate',
        name: '높은 에러율',
        metric: 'api.errorRate',
        operator: 'gt',
        threshold: 5, // 5%
        duration: 120, // 2분
        severity: 'high',
        enabled: true,
        notificationChannels: ['email', 'slack']
      },
      {
        id: 'database-connections',
        name: '데이터베이스 연결 수 과다',
        metric: 'database.activeConnections',
        operator: 'gt',
        threshold: 50,
        duration: 300, // 5분
        severity: 'medium',
        enabled: true,
        notificationChannels: ['slack']
      },
      {
        id: 'cache-hit-rate-low',
        name: '낮은 캐시 적중률',
        metric: 'cache.hitRate',
        operator: 'lt',
        threshold: 50, // 50%
        duration: 600, // 10분
        severity: 'low',
        enabled: true,
        notificationChannels: ['slack']
      }
    ];
  }

  /**
   * 알림 규칙 확인
   */
  private async checkAlertRules(metrics: SystemMetrics): Promise<void> {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      const currentValue = this.getMetricValue(metrics, rule.metric);
      const isTriggered = this.evaluateCondition(currentValue, rule.operator, rule.threshold);

      if (isTriggered) {
        await this.handleAlert(rule, currentValue);
      } else {
        await this.resolveAlert(rule.id);
      }
    }
  }

  /**
   * 메트릭 값 추출
   */
  private getMetricValue(metrics: SystemMetrics, metricPath: string): number {
    const parts = metricPath.split('.');
    let value: any = metrics;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return typeof value === 'number' ? value : 0;
  }

  /**
   * 조건 평가
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      case 'gte': return value >= threshold;
      case 'lte': return value <= threshold;
      default: return false;
    }
  }

  /**
   * 알림 처리
   */
  private async handleAlert(rule: AlertRule, currentValue: number): Promise<void> {
    // 이미 활성화된 알림이 있는지 확인
    const existingAlert = this.alerts.find(
      alert => alert.ruleId === rule.id && alert.status === 'active'
    );

    if (existingAlert) {
      return; // 이미 활성화된 알림이 있으면 중복 생성하지 않음
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      metric: rule.metric,
      currentValue,
      threshold: rule.threshold,
      severity: rule.severity,
      message: `${rule.name}: ${rule.metric} 값이 ${currentValue}로 임계값 ${rule.threshold}을 초과했습니다.`,
      triggeredAt: new Date(),
      status: 'active'
    };

    this.alerts.push(alert);

    // 알림 이벤트 발생
    this.emit('alert', alert);

    // 알림 전송
    await this.sendNotification(alert, rule.notificationChannels);

    console.warn(`Alert triggered: ${alert.message}`);
  }

  /**
   * 알림 해결
   */
  private async resolveAlert(ruleId: string): Promise<void> {
    const activeAlert = this.alerts.find(
      alert => alert.ruleId === ruleId && alert.status === 'active'
    );

    if (activeAlert) {
      activeAlert.status = 'resolved';
      activeAlert.resolvedAt = new Date();

      // 해결 이벤트 발생
      this.emit('alertResolved', activeAlert);

      console.info(`Alert resolved: ${activeAlert.message}`);
    }
  }

  /**
   * 알림 전송
   */
  private async sendNotification(alert: Alert, channels: string[]): Promise<void> {
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            await this.sendEmailNotification(alert);
            break;
          case 'slack':
            await this.sendSlackNotification(alert);
            break;
          case 'webhook':
            await this.sendWebhookNotification(alert);
            break;
          default:
            console.warn(`Unknown notification channel: ${channel}`);
        }
      } catch (error) {
        console.error(`Failed to send notification via ${channel}:`, error);
      }
    }
  }

  /**
   * 이메일 알림 전송
   */
  private async sendEmailNotification(alert: Alert): Promise<void> {
    // 실제 구현에서는 이메일 서비스 연동
    console.log(`Email notification: ${alert.message}`);
  }

  /**
   * Slack 알림 전송
   */
  private async sendSlackNotification(alert: Alert): Promise<void> {
    // 실제 구현에서는 Slack API 연동
    console.log(`Slack notification: ${alert.message}`);
  }

  /**
   * 웹훅 알림 전송
   */
  private async sendWebhookNotification(alert: Alert): Promise<void> {
    // 실제 구현에서는 웹훅 URL로 POST 요청
    console.log(`Webhook notification: ${alert.message}`);
  }

  /**
   * 최근 메트릭 조회
   */
  getRecentMetrics(count: number = 10): SystemMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * 활성 알림 조회
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => alert.status === 'active');
  }

  /**
   * 알림 규칙 조회
   */
  getAlertRules(): AlertRule[] {
    return this.alertRules;
  }

  /**
   * 사용자 행동 분석
   */
  analyzeUserBehavior(timeRange: { start: Date; end: Date }): {
    totalEvents: number;
    uniqueUsers: number;
    topPages: Array<{ page: string; count: number }>;
    topEvents: Array<{ event: string; count: number }>;
    hourlyDistribution: Array<{ hour: number; count: number }>;
  } {
    const filteredEvents = this.userBehaviorEvents.filter(
      event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );

    const uniqueUsers = new Set(filteredEvents.map(event => event.userId)).size;

    // 페이지별 집계
    const pageCount = new Map<string, number>();
    filteredEvents.forEach(event => {
      pageCount.set(event.page, (pageCount.get(event.page) || 0) + 1);
    });

    // 이벤트별 집계
    const eventCount = new Map<string, number>();
    filteredEvents.forEach(event => {
      eventCount.set(event.event, (eventCount.get(event.event) || 0) + 1);
    });

    // 시간대별 집계
    const hourlyCount = new Map<number, number>();
    filteredEvents.forEach(event => {
      const hour = event.timestamp.getHours();
      hourlyCount.set(hour, (hourlyCount.get(hour) || 0) + 1);
    });

    return {
      totalEvents: filteredEvents.length,
      uniqueUsers,
      topPages: Array.from(pageCount.entries())
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topEvents: Array.from(eventCount.entries())
        .map(([event, count]) => ({ event, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      hourlyDistribution: Array.from(hourlyCount.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour - b.hour)
    };
  }

  /**
   * 시스템 상태 요약
   */
  getSystemStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    activeAlerts: number;
    lastMetricTime: Date | null;
    uptime: number;
  } {
    const activeAlerts = this.getActiveAlerts();
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
    const highAlerts = activeAlerts.filter(alert => alert.severity === 'high');

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts.length > 0) {
      status = 'critical';
    } else if (highAlerts.length > 0 || activeAlerts.length > 5) {
      status = 'warning';
    }

    return {
      status,
      activeAlerts: activeAlerts.length,
      lastMetricTime: this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].timestamp : null,
      uptime: process.uptime()
    };
  }

  /**
   * 메트릭 데이터 정리
   */
  cleanup(): void {
    // 오래된 메트릭 제거 (24시간 이상)
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoffTime);

    // 해결된 알림 제거 (7일 이상)
    const alertCutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(
      alert => alert.status === 'active' || 
      (alert.resolvedAt && alert.resolvedAt > alertCutoffTime)
    );

    // 오래된 사용자 행동 이벤트 제거 (30일 이상)
    const behaviorCutoffTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.userBehaviorEvents = this.userBehaviorEvents.filter(
      event => event.timestamp > behaviorCutoffTime
    );

    console.log('Monitoring data cleanup completed');
  }
}

// 싱글톤 인스턴스 내보내기
export const monitoringService = MonitoringService.getInstance();