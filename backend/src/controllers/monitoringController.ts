import { Request, Response } from 'express';
import { monitoringService } from '../services/monitoringService';
import { loggingService } from '../services/loggingService';

/**
 * 시스템 상태 조회 (요구사항: 시스템 안정성)
 */
export async function getSystemStatus(req: Request, res: Response): Promise<void> {
  try {
    const status = monitoringService.getSystemStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '시스템 상태 조회에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'getSystemStatus' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SYSTEM_STATUS_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 실시간 메트릭 조회 (요구사항: 애플리케이션 성능 모니터링)
 */
export async function getRealtimeMetrics(req: Request, res: Response): Promise<void> {
  try {
    const count = parseInt(req.query.count as string) || 10;
    const metrics = monitoringService.getRecentMetrics(count);
    
    res.json({
      success: true,
      data: {
        metrics,
        timestamp: new Date()
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '실시간 메트릭 조회에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'getRealtimeMetrics' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'REALTIME_METRICS_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 활성 알림 조회 (요구사항: 에러 추적 및 알림 시스템)
 */
export async function getActiveAlerts(req: Request, res: Response): Promise<void> {
  try {
    const alerts = monitoringService.getActiveAlerts();
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '활성 알림 조회에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'getActiveAlerts' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVE_ALERTS_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 알림 규칙 조회 (요구사항: 에러 추적 및 알림 시스템)
 */
export async function getAlertRules(req: Request, res: Response): Promise<void> {
  try {
    const rules = monitoringService.getAlertRules();
    
    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알림 규칙 조회에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'getAlertRules' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'ALERT_RULES_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 사용자 행동 분석 (요구사항: 사용자 행동 분석)
 */
export async function getUserBehaviorAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    const analysis = monitoringService.analyzeUserBehavior({ start: startDate, end: endDate });
    
    res.json({
      success: true,
      data: {
        timeRange: { start: startDate, end: endDate },
        analysis
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '사용자 행동 분석에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'getUserBehaviorAnalysis' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_BEHAVIOR_ANALYSIS_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 사용자 행동 이벤트 추적 (요구사항: 사용자 행동 분석)
 */
export async function trackUserBehavior(req: Request, res: Response): Promise<void> {
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

    monitoringService.trackUserBehavior({
      userId,
      sessionId,
      event,
      page,
      metadata,
      userAgent,
      ip
    });

    loggingService.userActivity(`${event} on ${page}`, metadata, req);

    res.json({
      success: true,
      message: '사용자 행동이 추적되었습니다'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '사용자 행동 추적에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'trackUserBehavior' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_BEHAVIOR_TRACKING_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 로그 검색 (요구사항: 에러 추적 및 알림 시스템)
 */
export async function searchLogs(req: Request, res: Response): Promise<void> {
  try {
    const {
      level,
      service,
      userId,
      startDate,
      endDate,
      message,
      limit = 100
    } = req.query;

    const query = {
      level: level as any,
      service: service as string,
      userId: userId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      message: message as string,
      limit: parseInt(limit as string)
    };

    const logs = await loggingService.searchLogs(query);
    
    res.json({
      success: true,
      data: {
        query,
        logs,
        count: logs.length
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '로그 검색에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'searchLogs' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'LOG_SEARCH_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 로그 통계 조회 (요구사항: 에러 추적 및 알림 시스템)
 */
export async function getLogStatistics(req: Request, res: Response): Promise<void> {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    const statistics = await loggingService.getLogStatistics({ start: startDate, end: endDate });
    
    res.json({
      success: true,
      data: {
        timeRange: { start: startDate, end: endDate },
        statistics
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '로그 통계 조회에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'getLogStatistics' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'LOG_STATISTICS_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 모니터링 시작 (요구사항: 애플리케이션 성능 모니터링)
 */
export async function startMonitoring(req: Request, res: Response): Promise<void> {
  try {
    const { interval = 60000 } = req.body;
    
    monitoringService.startMonitoring(interval);
    
    loggingService.info('System monitoring started', { interval }, req);
    
    res.json({
      success: true,
      message: '시스템 모니터링이 시작되었습니다',
      data: { interval }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '모니터링 시작에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'startMonitoring' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'START_MONITORING_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 모니터링 중지 (요구사항: 애플리케이션 성능 모니터링)
 */
export async function stopMonitoring(req: Request, res: Response): Promise<void> {
  try {
    monitoringService.stopMonitoring();
    
    loggingService.info('System monitoring stopped', {}, req);
    
    res.json({
      success: true,
      message: '시스템 모니터링이 중지되었습니다'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '모니터링 중지에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'stopMonitoring' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STOP_MONITORING_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 로그 내보내기 (요구사항: 에러 추적 및 알림 시스템)
 */
export async function exportLogs(req: Request, res: Response): Promise<void> {
  try {
    const {
      startDate,
      endDate,
      level,
      service,
      format = 'json'
    } = req.body;

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

    const exportData = await loggingService.exportLogs(query);
    
    const filename = `logs_${startDate}_${endDate}.${format}`;
    
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(exportData);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '로그 내보내기에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'exportLogs' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'LOG_EXPORT_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 시스템 정리 (요구사항: 시스템 안정성)
 */
export async function cleanupSystem(req: Request, res: Response): Promise<void> {
  try {
    const { retentionDays = 90 } = req.body;
    
    // 모니터링 데이터 정리
    monitoringService.cleanup();
    
    // 로그 정리
    const cleanedLogs = await loggingService.cleanupLogs(retentionDays);
    
    loggingService.info('System cleanup completed', { 
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '시스템 정리에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'cleanupSystem' }, req);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'SYSTEM_CLEANUP_FAILED',
        message: errorMessage
      }
    });
  }
}

/**
 * 헬스 체크 (요구사항: 시스템 안정성)
 */
export async function healthCheck(req: Request, res: Response): Promise<void> {
  try {
    const status = monitoringService.getSystemStatus();
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '헬스 체크에 실패했습니다';
    
    loggingService.error(errorMessage, { endpoint: 'healthCheck' }, req);
    
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: errorMessage
      }
    });
  }
}