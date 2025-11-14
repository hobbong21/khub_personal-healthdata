"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringService = exports.MonitoringService = void 0;
const events_1 = require("events");
const database_1 = __importDefault(require("../config/database"));
const redis_1 = require("../config/redis");
class MonitoringService extends events_1.EventEmitter {
    constructor() {
        super();
        this.metrics = [];
        this.alerts = [];
        this.alertRules = [];
        this.userBehaviorEvents = [];
        this.isMonitoring = false;
        this.apiMetrics = {
            requestCount: 0,
            totalResponseTime: 0,
            errorCount: 0,
            requestTimes: []
        };
        this.initializeDefaultAlertRules();
    }
    static getInstance() {
        if (!MonitoringService.instance) {
            MonitoringService.instance = new MonitoringService();
        }
        return MonitoringService.instance;
    }
    startMonitoring(intervalMs = 60000) {
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
                if (this.metrics.length > 100) {
                    this.metrics.shift();
                }
                await this.checkAlertRules(metrics);
                this.emit('metrics', metrics);
            }
            catch (error) {
                console.error('Error collecting system metrics:', error);
            }
        }, intervalMs);
    }
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
        this.isMonitoring = false;
        console.log('System monitoring stopped');
    }
    async collectSystemMetrics() {
        const timestamp = new Date();
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const dbMetrics = await this.collectDatabaseMetrics();
        const cacheMetrics = await this.collectCacheMetrics();
        const apiMetrics = this.collectAPIMetrics();
        return {
            timestamp,
            cpu: {
                usage: (cpuUsage.user + cpuUsage.system) / 1000000,
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
    async collectDatabaseMetrics() {
        try {
            const connectionResult = await database_1.default.$queryRaw `
        SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active'
      `;
            const statsResult = await database_1.default.$queryRaw `
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
        }
        catch (error) {
            console.error('Failed to collect database metrics:', error);
            return {
                activeConnections: 0,
                queryCount: 0,
                avgQueryTime: 0
            };
        }
    }
    async collectCacheMetrics() {
        try {
            const stats = await redis_1.redisService.getCacheStats();
            return stats;
        }
        catch (error) {
            console.error('Failed to collect cache metrics:', error);
            return {
                hitRate: 0,
                keyCount: 0,
                memoryUsage: '0B'
            };
        }
    }
    collectAPIMetrics() {
        const { requestCount, totalResponseTime, errorCount, requestTimes } = this.apiMetrics;
        const avgResponseTime = requestCount > 0 ? totalResponseTime / requestCount : 0;
        const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
        return {
            requestCount,
            avgResponseTime,
            errorRate
        };
    }
    trackAPIRequest(responseTime, isError = false) {
        this.apiMetrics.requestCount++;
        this.apiMetrics.totalResponseTime += responseTime;
        this.apiMetrics.requestTimes.push(responseTime);
        if (isError) {
            this.apiMetrics.errorCount++;
        }
        if (this.apiMetrics.requestTimes.length > 1000) {
            this.apiMetrics.requestTimes.shift();
        }
    }
    trackUserBehavior(event) {
        const behaviorEvent = {
            ...event,
            timestamp: new Date()
        };
        this.userBehaviorEvents.push(behaviorEvent);
        if (this.userBehaviorEvents.length > 10000) {
            this.userBehaviorEvents.shift();
        }
        this.emit('userBehavior', behaviorEvent);
    }
    initializeDefaultAlertRules() {
        this.alertRules = [
            {
                id: 'high-memory-usage',
                name: '높은 메모리 사용률',
                metric: 'memory.percentage',
                operator: 'gt',
                threshold: 85,
                duration: 300,
                severity: 'high',
                enabled: true,
                notificationChannels: ['email', 'slack']
            },
            {
                id: 'high-response-time',
                name: '높은 API 응답 시간',
                metric: 'api.avgResponseTime',
                operator: 'gt',
                threshold: 1000,
                duration: 180,
                severity: 'medium',
                enabled: true,
                notificationChannels: ['slack']
            },
            {
                id: 'high-error-rate',
                name: '높은 에러율',
                metric: 'api.errorRate',
                operator: 'gt',
                threshold: 5,
                duration: 120,
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
                duration: 300,
                severity: 'medium',
                enabled: true,
                notificationChannels: ['slack']
            },
            {
                id: 'cache-hit-rate-low',
                name: '낮은 캐시 적중률',
                metric: 'cache.hitRate',
                operator: 'lt',
                threshold: 50,
                duration: 600,
                severity: 'low',
                enabled: true,
                notificationChannels: ['slack']
            }
        ];
    }
    async checkAlertRules(metrics) {
        for (const rule of this.alertRules) {
            if (!rule.enabled)
                continue;
            const currentValue = this.getMetricValue(metrics, rule.metric);
            const isTriggered = this.evaluateCondition(currentValue, rule.operator, rule.threshold);
            if (isTriggered) {
                await this.handleAlert(rule, currentValue);
            }
            else {
                await this.resolveAlert(rule.id);
            }
        }
    }
    getMetricValue(metrics, metricPath) {
        const parts = metricPath.split('.');
        let value = metrics;
        for (const part of parts) {
            value = value?.[part];
        }
        return typeof value === 'number' ? value : 0;
    }
    evaluateCondition(value, operator, threshold) {
        switch (operator) {
            case 'gt': return value > threshold;
            case 'lt': return value < threshold;
            case 'eq': return value === threshold;
            case 'gte': return value >= threshold;
            case 'lte': return value <= threshold;
            default: return false;
        }
    }
    async handleAlert(rule, currentValue) {
        const existingAlert = this.alerts.find(alert => alert.ruleId === rule.id && alert.status === 'active');
        if (existingAlert) {
            return;
        }
        const alert = {
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
        this.emit('alert', alert);
        await this.sendNotification(alert, rule.notificationChannels);
        console.warn(`Alert triggered: ${alert.message}`);
    }
    async resolveAlert(ruleId) {
        const activeAlert = this.alerts.find(alert => alert.ruleId === ruleId && alert.status === 'active');
        if (activeAlert) {
            activeAlert.status = 'resolved';
            activeAlert.resolvedAt = new Date();
            this.emit('alertResolved', activeAlert);
            console.info(`Alert resolved: ${activeAlert.message}`);
        }
    }
    async sendNotification(alert, channels) {
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
            }
            catch (error) {
                console.error(`Failed to send notification via ${channel}:`, error);
            }
        }
    }
    async sendEmailNotification(alert) {
        console.log(`Email notification: ${alert.message}`);
    }
    async sendSlackNotification(alert) {
        console.log(`Slack notification: ${alert.message}`);
    }
    async sendWebhookNotification(alert) {
        console.log(`Webhook notification: ${alert.message}`);
    }
    getRecentMetrics(count = 10) {
        return this.metrics.slice(-count);
    }
    getActiveAlerts() {
        return this.alerts.filter(alert => alert.status === 'active');
    }
    getAlertRules() {
        return this.alertRules;
    }
    analyzeUserBehavior(timeRange) {
        const filteredEvents = this.userBehaviorEvents.filter(event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end);
        const uniqueUsers = new Set(filteredEvents.map(event => event.userId)).size;
        const pageCount = new Map();
        filteredEvents.forEach(event => {
            pageCount.set(event.page, (pageCount.get(event.page) || 0) + 1);
        });
        const eventCount = new Map();
        filteredEvents.forEach(event => {
            eventCount.set(event.event, (eventCount.get(event.event) || 0) + 1);
        });
        const hourlyCount = new Map();
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
    getSystemStatus() {
        const activeAlerts = this.getActiveAlerts();
        const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
        const highAlerts = activeAlerts.filter(alert => alert.severity === 'high');
        let status = 'healthy';
        if (criticalAlerts.length > 0) {
            status = 'critical';
        }
        else if (highAlerts.length > 0 || activeAlerts.length > 5) {
            status = 'warning';
        }
        return {
            status,
            activeAlerts: activeAlerts.length,
            lastMetricTime: this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].timestamp : null,
            uptime: process.uptime()
        };
    }
    cleanup() {
        const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.metrics = this.metrics.filter(metric => metric.timestamp > cutoffTime);
        const alertCutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        this.alerts = this.alerts.filter(alert => alert.status === 'active' ||
            (alert.resolvedAt && alert.resolvedAt > alertCutoffTime));
        const behaviorCutoffTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        this.userBehaviorEvents = this.userBehaviorEvents.filter(event => event.timestamp > behaviorCutoffTime);
        console.log('Monitoring data cleanup completed');
    }
}
exports.MonitoringService = MonitoringService;
exports.monitoringService = MonitoringService.getInstance();
//# sourceMappingURL=monitoringService.js.map