"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemStatus = getSystemStatus;
exports.getRealtimeMetrics = getRealtimeMetrics;
exports.getActiveAlerts = getActiveAlerts;
exports.getAlertRules = getAlertRules;
exports.getUserBehaviorAnalysis = getUserBehaviorAnalysis;
exports.trackUserBehavior = trackUserBehavior;
exports.searchLogs = searchLogs;
exports.getLogStatistics = getLogStatistics;
exports.startMonitoring = startMonitoring;
exports.stopMonitoring = stopMonitoring;
exports.exportLogs = exportLogs;
exports.cleanupSystem = cleanupSystem;
exports.healthCheck = healthCheck;
const monitoringService_1 = require("../services/monitoringService");
const loggingService_1 = require("../services/loggingService");
async function getSystemStatus(req, res) {
    try {
        const status = monitoringService_1.monitoringService.getSystemStatus();
        res.json({
            success: true,
            data: status
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '시스템 상태 조회에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'getSystemStatus' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'SYSTEM_STATUS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getRealtimeMetrics(req, res) {
    try {
        const count = parseInt(req.query.count) || 10;
        const metrics = monitoringService_1.monitoringService.getRecentMetrics(count);
        res.json({
            success: true,
            data: {
                metrics,
                timestamp: new Date()
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '실시간 메트릭 조회에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'getRealtimeMetrics' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'REALTIME_METRICS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getActiveAlerts(req, res) {
    try {
        const alerts = monitoringService_1.monitoringService.getActiveAlerts();
        res.json({
            success: true,
            data: alerts
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '활성 알림 조회에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'getActiveAlerts' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'ACTIVE_ALERTS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getAlertRules(req, res) {
    try {
        const rules = monitoringService_1.monitoringService.getAlertRules();
        res.json({
            success: true,
            data: rules
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알림 규칙 조회에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'getAlertRules' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'ALERT_RULES_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getUserBehaviorAnalysis(req, res) {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
        const analysis = monitoringService_1.monitoringService.analyzeUserBehavior({ start: startDate, end: endDate });
        res.json({
            success: true,
            data: {
                timeRange: { start: startDate, end: endDate },
                analysis
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '사용자 행동 분석에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'getUserBehaviorAnalysis' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'USER_BEHAVIOR_ANALYSIS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function trackUserBehavior(req, res) {
    try {
        const { event, page, metadata } = req.body;
        if (!event || !page) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_REQUIRED_FIELDS',
                    message: 'event와 page 필드는 필수입니다'
                }
            });
            return;
        }
        const userId = req.user?.id || 'anonymous';
        const sessionId = req.sessionID || 'unknown';
        const userAgent = req.get('User-Agent');
        const ip = req.ip;
        monitoringService_1.monitoringService.trackUserBehavior({
            userId,
            sessionId,
            event,
            page,
            metadata,
            userAgent,
            ip
        });
        loggingService_1.loggingService.userActivity(`${event} on ${page}`, metadata, req);
        res.json({
            success: true,
            message: '사용자 행동이 추적되었습니다'
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '사용자 행동 추적에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'trackUserBehavior' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'USER_BEHAVIOR_TRACKING_FAILED',
                message: errorMessage
            }
        });
    }
}
async function searchLogs(req, res) {
    try {
        const { level, service, userId, startDate, endDate, message, limit = 100 } = req.query;
        const query = {
            level: level,
            service: service,
            userId: userId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            message: message,
            limit: parseInt(limit)
        };
        const logs = await loggingService_1.loggingService.searchLogs(query);
        res.json({
            success: true,
            data: {
                query,
                logs,
                count: logs.length
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '로그 검색에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'searchLogs' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'LOG_SEARCH_FAILED',
                message: errorMessage
            }
        });
    }
}
async function getLogStatistics(req, res) {
    try {
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
        const statistics = await loggingService_1.loggingService.getLogStatistics({ start: startDate, end: endDate });
        res.json({
            success: true,
            data: {
                timeRange: { start: startDate, end: endDate },
                statistics
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '로그 통계 조회에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'getLogStatistics' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'LOG_STATISTICS_FAILED',
                message: errorMessage
            }
        });
    }
}
async function startMonitoring(req, res) {
    try {
        const { interval = 60000 } = req.body;
        monitoringService_1.monitoringService.startMonitoring(interval);
        loggingService_1.loggingService.info('System monitoring started', { interval }, req);
        res.json({
            success: true,
            message: '시스템 모니터링이 시작되었습니다',
            data: { interval }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '모니터링 시작에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'startMonitoring' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'START_MONITORING_FAILED',
                message: errorMessage
            }
        });
    }
}
async function stopMonitoring(req, res) {
    try {
        monitoringService_1.monitoringService.stopMonitoring();
        loggingService_1.loggingService.info('System monitoring stopped', {}, req);
        res.json({
            success: true,
            message: '시스템 모니터링이 중지되었습니다'
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '모니터링 중지에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'stopMonitoring' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'STOP_MONITORING_FAILED',
                message: errorMessage
            }
        });
    }
}
async function exportLogs(req, res) {
    try {
        const { startDate, endDate, level, service, format = 'json' } = req.body;
        if (!startDate || !endDate) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_DATE_RANGE',
                    message: '시작 날짜와 종료 날짜를 제공해주세요'
                }
            });
            return;
        }
        const query = {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            level,
            service,
            format
        };
        const exportData = await loggingService_1.loggingService.exportLogs(query);
        const filename = `logs_${startDate}_${endDate}.${format}`;
        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(exportData);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '로그 내보내기에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'exportLogs' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'LOG_EXPORT_FAILED',
                message: errorMessage
            }
        });
    }
}
async function cleanupSystem(req, res) {
    try {
        const { retentionDays = 90 } = req.body;
        monitoringService_1.monitoringService.cleanup();
        const cleanedLogs = await loggingService_1.loggingService.cleanupLogs(retentionDays);
        loggingService_1.loggingService.info('System cleanup completed', {
            retentionDays,
            cleanedLogs
        }, req);
        res.json({
            success: true,
            message: '시스템 정리가 완료되었습니다',
            data: {
                retentionDays,
                cleanedLogs
            }
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '시스템 정리에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'cleanupSystem' }, req);
        res.status(500).json({
            success: false,
            error: {
                code: 'SYSTEM_CLEANUP_FAILED',
                message: errorMessage
            }
        });
    }
}
async function healthCheck(req, res) {
    try {
        const status = monitoringService_1.monitoringService.getSystemStatus();
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        const healthStatus = {
            status: status.status,
            uptime,
            memory: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
            },
            activeAlerts: status.activeAlerts,
            timestamp: new Date()
        };
        const httpStatus = status.status === 'critical' ? 503 :
            status.status === 'warning' ? 200 : 200;
        res.status(httpStatus).json({
            success: true,
            data: healthStatus
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : '헬스 체크에 실패했습니다';
        loggingService_1.loggingService.error(errorMessage, { endpoint: 'healthCheck' }, req);
        res.status(503).json({
            success: false,
            error: {
                code: 'HEALTH_CHECK_FAILED',
                message: errorMessage
            }
        });
    }
}
//# sourceMappingURL=monitoringController.js.map