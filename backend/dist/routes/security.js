"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const securityAuditService_1 = require("../services/securityAuditService");
const performanceOptimizationService_1 = require("../services/performanceOptimizationService");
const security_1 = require("../middleware/security");
const monitoring_1 = require("../middleware/monitoring");
const router = (0, express_1.Router)();
router.get('/dashboard', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), (0, monitoring_1.logDataAccess)('security_dashboard', 'read'), async (req, res) => {
    try {
        const dashboard = securityAuditService_1.securityAuditService.getSecurityDashboard();
        (0, security_1.auditLog)(req, 'SECURITY_DASHBOARD_ACCESSED', {
            riskScore: dashboard.riskScore,
            activeThreats: dashboard.overview.activeThreats
        });
        res.json({
            success: true,
            data: dashboard
        });
    }
    catch (error) {
        console.error('Security dashboard error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SECURITY_DASHBOARD_ERROR',
                message: '보안 대시보드 데이터를 가져오는데 실패했습니다.'
            }
        });
    }
});
router.get('/metrics', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), (0, monitoring_1.logDataAccess)('security_metrics', 'read'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const timeRange = startDate && endDate ? {
            start: new Date(startDate),
            end: new Date(endDate)
        } : undefined;
        const metrics = securityAuditService_1.securityAuditService.getSecurityMetrics(timeRange);
        res.json({
            success: true,
            data: metrics
        });
    }
    catch (error) {
        console.error('Security metrics error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SECURITY_METRICS_ERROR',
                message: '보안 메트릭을 가져오는데 실패했습니다.'
            }
        });
    }
});
router.get('/suspicious-patterns', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), (0, monitoring_1.logDataAccess)('suspicious_patterns', 'read'), async (req, res) => {
    try {
        const patterns = securityAuditService_1.securityAuditService.detectSuspiciousPatterns();
        (0, security_1.auditLog)(req, 'SUSPICIOUS_PATTERNS_ANALYZED', {
            patternCount: patterns.length,
            criticalPatterns: patterns.filter(p => p.severity === 'critical').length
        });
        res.json({
            success: true,
            data: patterns
        });
    }
    catch (error) {
        console.error('Suspicious patterns analysis error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SUSPICIOUS_PATTERNS_ERROR',
                message: '의심스러운 패턴 분석에 실패했습니다.'
            }
        });
    }
});
router.post('/events/:eventId/resolve', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), (0, monitoring_1.logDataAccess)('security_event', 'write'), async (req, res) => {
    try {
        const { eventId } = req.params;
        const { resolvedBy } = req.body;
        if (!resolvedBy) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_RESOLVER',
                    message: '해결자 정보가 필요합니다.'
                }
            });
        }
        const success = await securityAuditService_1.securityAuditService.resolveSecurityEvent(eventId, resolvedBy);
        if (!success) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'EVENT_NOT_FOUND',
                    message: '해당 보안 이벤트를 찾을 수 없습니다.'
                }
            });
        }
        (0, security_1.auditLog)(req, 'SECURITY_EVENT_RESOLVED', {
            eventId,
            resolvedBy
        });
        return res.json({
            success: true,
            message: '보안 이벤트가 해결되었습니다.'
        });
    }
    catch (error) {
        console.error('Security event resolution error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'EVENT_RESOLUTION_ERROR',
                message: '보안 이벤트 해결 처리에 실패했습니다.'
            }
        });
    }
});
router.get('/events/export', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), (0, monitoring_1.logDataAccess)('security_events', 'read'), async (req, res) => {
    try {
        const { startDate, endDate, format = 'json' } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_DATE_RANGE',
                    message: '시작일과 종료일이 필요합니다.'
                }
            });
        }
        const timeRange = {
            start: new Date(startDate),
            end: new Date(endDate)
        };
        const exportData = securityAuditService_1.securityAuditService.exportSecurityEvents(timeRange, format);
        (0, security_1.auditLog)(req, 'SECURITY_EVENTS_EXPORTED', {
            timeRange,
            format,
            dataSize: exportData.length
        });
        const contentType = format === 'csv' ? 'text/csv' : 'application/json';
        const filename = `security_events_${startDate}_${endDate}.${format}`;
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(exportData);
    }
    catch (error) {
        console.error('Security events export error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'EXPORT_ERROR',
                message: '보안 이벤트 내보내기에 실패했습니다.'
            }
        });
    }
});
router.post('/performance/optimize', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), (0, monitoring_1.logDataAccess)('performance_optimization', 'write'), async (req, res) => {
    try {
        const report = await performanceOptimizationService_1.performanceOptimizationService.generateOptimizationReport();
        (0, security_1.auditLog)(req, 'PERFORMANCE_OPTIMIZATION_EXECUTED', {
            overallScore: report.overallScore,
            recommendationCount: report.recommendations.length,
            autoOptimizationCount: report.autoOptimizations.length
        });
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        console.error('Performance optimization error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'OPTIMIZATION_ERROR',
                message: '성능 최적화 분석에 실패했습니다.'
            }
        });
    }
});
router.get('/performance/history', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), (0, monitoring_1.logDataAccess)('performance_history', 'read'), async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const history = performanceOptimizationService_1.performanceOptimizationService.getOptimizationHistory(Number(limit));
        res.json({
            success: true,
            data: history
        });
    }
    catch (error) {
        console.error('Performance history error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'HISTORY_ERROR',
                message: '성능 최적화 이력을 가져오는데 실패했습니다.'
            }
        });
    }
});
router.get('/performance/trends', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), (0, monitoring_1.logDataAccess)('performance_trends', 'read'), async (req, res) => {
    try {
        const trends = performanceOptimizationService_1.performanceOptimizationService.analyzePerformanceTrends();
        res.json({
            success: true,
            data: trends
        });
    }
    catch (error) {
        console.error('Performance trends error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'TRENDS_ERROR',
                message: '성능 트렌드 분석에 실패했습니다.'
            }
        });
    }
});
router.put('/performance/auto-optimization', (0, security_1.requirePermission)(security_1.Permission.SYSTEM_ADMIN), (0, monitoring_1.logDataAccess)('auto_optimization_settings', 'write'), async (req, res) => {
    try {
        const { enabled } = req.body;
        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_SETTING',
                    message: '유효한 설정 값이 필요합니다.'
                }
            });
        }
        performanceOptimizationService_1.performanceOptimizationService.setAutoOptimization(enabled);
        (0, security_1.auditLog)(req, 'AUTO_OPTIMIZATION_SETTING_CHANGED', {
            enabled,
            changedBy: req.user?.id
        });
        return res.json({
            success: true,
            message: `자동 최적화가 ${enabled ? '활성화' : '비활성화'}되었습니다.`
        });
    }
    catch (error) {
        console.error('Auto optimization setting error:', error);
        return res.status(500).json({
            success: false,
            error: {
                code: 'SETTING_ERROR',
                message: '자동 최적화 설정 변경에 실패했습니다.'
            }
        });
    }
});
router.get('/health', async (req, res) => {
    try {
        const securityDashboard = securityAuditService_1.securityAuditService.getSecurityDashboard();
        const performanceTrends = performanceOptimizationService_1.performanceOptimizationService.analyzePerformanceTrends();
        const systemHealth = {
            security: {
                riskScore: securityDashboard.riskScore,
                activeThreats: securityDashboard.overview.activeThreats,
                status: securityDashboard.riskScore < 30 ? 'healthy' :
                    securityDashboard.riskScore < 70 ? 'warning' : 'critical'
            },
            performance: {
                scoreImprovement: performanceTrends.scoreImprovement,
                criticalIssues: performanceTrends.criticalIssues,
                status: performanceTrends.criticalIssues === 0 ? 'healthy' :
                    performanceTrends.criticalIssues < 3 ? 'warning' : 'critical'
            },
            overall: 'healthy'
        };
        if (systemHealth.security.status === 'critical' || systemHealth.performance.status === 'critical') {
            systemHealth.overall = 'critical';
        }
        else if (systemHealth.security.status === 'warning' || systemHealth.performance.status === 'warning') {
            systemHealth.overall = 'warning';
        }
        res.json({
            success: true,
            data: systemHealth
        });
    }
    catch (error) {
        console.error('System health check error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'HEALTH_CHECK_ERROR',
                message: '시스템 상태 확인에 실패했습니다.'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=security.js.map