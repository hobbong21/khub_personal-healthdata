import { Request, Response } from 'express';
import { RemoteMonitoringModel } from '../models/RemoteMonitoring';
import { AuthenticatedRequest } from '../middleware/auth';

export class RemoteMonitoringController {
  /**
   * 원격 모니터링 세션 시작 (요구사항 17.4)
   */
  static async startMonitoringSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionType, monitoringParameters, alertThresholds, notes } = req.body;

      // 기존 활성 세션이 있는지 확인
      const existingSession = await RemoteMonitoringModel.getActiveSession(userId);
      if (existingSession) {
        return res.status(400).json({
          error: '이미 활성화된 모니터링 세션이 있습니다.',
        });
      }

      const session = await RemoteMonitoringModel.createSession({
        userId,
        sessionType,
        monitoringParameters,
        alertThresholds,
        notes,
      });

      res.status(201).json({
        message: '원격 모니터링 세션이 시작되었습니다.',
        session,
      });
    } catch (error) {
      console.error('Error starting monitoring session:', error);
      res.status(500).json({
        error: '모니터링 세션 시작 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 실시간 건강 데이터 추가 (요구사항 17.4)
   */
  static async addRealTimeData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { dataType, value, unit, deviceSource, recordedAt } = req.body;

      const data = await RemoteMonitoringModel.addRealTimeData({
        userId,
        dataType,
        value,
        unit,
        deviceSource,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      });

      res.status(201).json({
        message: '실시간 건강 데이터가 추가되었습니다.',
        data,
      });
    } catch (error) {
      console.error('Error adding real-time data:', error);
      res.status(500).json({
        error: '실시간 데이터 추가 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 모니터링 대시보드 데이터 조회 (요구사항 17.4)
   */
  static async getDashboardData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const dashboardData = await RemoteMonitoringModel.getDashboardData(userId);

      res.json({
        message: '모니터링 대시보드 데이터를 조회했습니다.',
        data: dashboardData,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({
        error: '대시보드 데이터 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 실시간 건강 데이터 조회 (요구사항 17.4)
   */
  static async getRealTimeData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { dataType, limit } = req.query;

      const data = await RemoteMonitoringModel.getRealTimeData(
        userId,
        dataType as string,
        limit ? parseInt(limit as string) : 100
      );

      res.json({
        message: '실시간 건강 데이터를 조회했습니다.',
        data,
      });
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      res.status(500).json({
        error: '실시간 데이터 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 건강 알림 조회 (요구사항 17.4)
   */
  static async getHealthAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const alerts = await RemoteMonitoringModel.getUnacknowledgedAlerts(userId);

      res.json({
        message: '건강 알림을 조회했습니다.',
        alerts,
      });
    } catch (error) {
      console.error('Error fetching health alerts:', error);
      res.status(500).json({
        error: '건강 알림 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 알림 확인 처리 (요구사항 17.4)
   */
  static async acknowledgeAlert(req: AuthenticatedRequest, res: Response) {
    try {
      const { alertId } = req.params;
      const acknowledgedBy = req.user!.name || req.user!.email;

      const alert = await RemoteMonitoringModel.acknowledgeAlert(alertId, acknowledgedBy);

      res.json({
        message: '알림이 확인되었습니다.',
        alert,
      });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      res.status(500).json({
        error: '알림 확인 처리 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 의료진과 데이터 공유 설정 (요구사항 17.4)
   */
  static async createDataShare(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        healthcareProviderEmail,
        healthcareProviderName,
        sharedDataTypes,
        accessLevel,
        startDate,
        endDate,
      } = req.body;

      const dataShare = await RemoteMonitoringModel.createDataShare({
        userId,
        healthcareProviderEmail,
        healthcareProviderName,
        sharedDataTypes,
        accessLevel,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
      });

      res.status(201).json({
        message: '의료진과의 데이터 공유가 설정되었습니다.',
        dataShare,
      });
    } catch (error) {
      console.error('Error creating data share:', error);
      res.status(500).json({
        error: '데이터 공유 설정 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 모니터링 세션 종료 (요구사항 17.4)
   */
  static async endMonitoringSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;

      // 세션 소유권 확인
      const session = await RemoteMonitoringModel.getActiveSession(userId);
      if (!session || session.id !== sessionId) {
        return res.status(404).json({
          error: '해당 모니터링 세션을 찾을 수 없습니다.',
        });
      }

      const endedSession = await RemoteMonitoringModel.endSession(sessionId);

      res.json({
        message: '모니터링 세션이 종료되었습니다.',
        session: endedSession,
      });
    } catch (error) {
      console.error('Error ending monitoring session:', error);
      res.status(500).json({
        error: '모니터링 세션 종료 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 이상 징후 감지 (요구사항 17.4)
   */
  static async detectAnomalies(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { dataType, timeRange } = req.query;

      // 최근 데이터 조회
      const recentData = await RemoteMonitoringModel.getRealTimeData(
        userId,
        dataType as string,
        100
      );

      // 간단한 이상 징후 감지 로직 (실제로는 더 복잡한 ML 알고리즘 사용)
      const anomalies = this.detectDataAnomalies(recentData);

      // 이상 징후 발견 시 알림 생성
      for (const anomaly of anomalies) {
        await RemoteMonitoringModel.createHealthAlert({
          userId,
          alertType: 'anomaly_detected',
          severity: anomaly.severity,
          title: `${anomaly.dataType} 이상 징후 감지`,
          message: anomaly.description,
          dataReference: { anomalyData: anomaly },
        });
      }

      res.json({
        message: '이상 징후 감지가 완료되었습니다.',
        anomalies,
      });
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      res.status(500).json({
        error: '이상 징후 감지 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 데이터 이상 징후 감지 로직
   */
  private static detectDataAnomalies(data: any[]): any[] {
    const anomalies: any[] = [];

    if (data.length < 10) {
      return anomalies; // 데이터가 충분하지 않음
    }

    // 데이터 타입별로 그룹화
    const groupedData = data.reduce((acc, item) => {
      if (!acc[item.dataType]) {
        acc[item.dataType] = [];
      }
      acc[item.dataType].push(item);
      return acc;
    }, {});

    // 각 데이터 타입별로 이상 징후 검사
    Object.keys(groupedData).forEach((dataType) => {
      const typeData = groupedData[dataType];
      
      if (dataType === 'heart_rate') {
        const values = typeData.map((d: any) => d.value);
        const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(
          values.reduce((acc: number, val: number) => acc + Math.pow(val - avg, 2), 0) / values.length
        );

        // 표준편차의 2배를 벗어나는 값들을 이상 징후로 판단
        typeData.forEach((item: any) => {
          if (Math.abs(item.value - avg) > 2 * stdDev) {
            anomalies.push({
              dataType,
              value: item.value,
              recordedAt: item.recordedAt,
              severity: Math.abs(item.value - avg) > 3 * stdDev ? 'high' : 'medium',
              description: `심박수가 평균(${avg.toFixed(1)})에서 크게 벗어났습니다: ${item.value}`,
            });
          }
        });
      }
    });

    return anomalies;
  }
}