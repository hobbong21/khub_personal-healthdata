import prisma from '../config/database';

export interface RemoteMonitoringSession {
  id: string;
  userId: string;
  healthcareProviderId?: string;
  sessionType: 'continuous' | 'scheduled' | 'emergency';
  status: 'active' | 'paused' | 'completed' | 'terminated';
  startTime: Date;
  endTime?: Date;
  monitoringParameters?: any;
  alertThresholds?: any;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RealTimeHealthData {
  id: string;
  userId: string;
  monitoringSessionId?: string;
  dataType: string;
  value: any;
  unit?: string;
  deviceSource?: string;
  isCritical: boolean;
  recordedAt: Date;
  processedAt: Date;
}

export interface HealthAlert {
  id: string;
  userId: string;
  monitoringSessionId?: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  dataReference?: any;
  isAcknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface HealthcareDataShare {
  id: string;
  userId: string;
  healthcareProviderEmail: string;
  healthcareProviderName?: string;
  sharedDataTypes: any;
  accessLevel: 'read_only' | 'read_write';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  accessToken?: string;
  lastAccessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class RemoteMonitoringModel {
  /**
   * 원격 모니터링 세션 생성 (요구사항 17.4)
   */
  static async createSession(sessionData: {
    userId: string;
    sessionType: 'continuous' | 'scheduled' | 'emergency';
    monitoringParameters?: any;
    alertThresholds?: any;
    notes?: string;
  }): Promise<RemoteMonitoringSession> {
    const session = await prisma.remoteMonitoringSession.create({
      data: {
        userId: sessionData.userId,
        sessionType: sessionData.sessionType,
        monitoringParameters: sessionData.monitoringParameters,
        alertThresholds: sessionData.alertThresholds,
        notes: sessionData.notes,
      },
    });

    return session as RemoteMonitoringSession;
  }

  /**
   * 실시간 건강 데이터 저장 (요구사항 17.4)
   */
  static async addRealTimeData(healthData: {
    userId: string;
    monitoringSessionId?: string;
    dataType: string;
    value: any;
    unit?: string;
    deviceSource?: string;
    recordedAt: Date;
  }): Promise<RealTimeHealthData> {
    // 임계값 확인 및 알림 생성
    const isCritical = await this.checkCriticalThresholds(
      healthData.userId,
      healthData.dataType,
      healthData.value
    );

    const data = await prisma.realTimeHealthData.create({
      data: {
        userId: healthData.userId,
        monitoringSessionId: healthData.monitoringSessionId,
        dataType: healthData.dataType,
        value: healthData.value,
        unit: healthData.unit,
        deviceSource: healthData.deviceSource,
        isCritical,
        recordedAt: healthData.recordedAt,
      },
    });

    // 임계값 초과 시 알림 생성
    if (isCritical) {
      await this.createHealthAlert({
        userId: healthData.userId,
        monitoringSessionId: healthData.monitoringSessionId,
        alertType: 'threshold_exceeded',
        severity: 'high',
        title: `${healthData.dataType} 임계값 초과`,
        message: `${healthData.dataType} 값이 정상 범위를 벗어났습니다: ${JSON.stringify(healthData.value)}`,
        dataReference: { realTimeDataId: data.id },
      });
    }

    return data as RealTimeHealthData;
  }

  /**
   * 건강 알림 생성 (요구사항 17.4)
   */
  static async createHealthAlert(alertData: {
    userId: string;
    monitoringSessionId?: string;
    alertType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    dataReference?: any;
  }): Promise<HealthAlert> {
    const alert = await prisma.healthAlert.create({
      data: {
        userId: alertData.userId,
        monitoringSessionId: alertData.monitoringSessionId,
        alertType: alertData.alertType,
        severity: alertData.severity,
        title: alertData.title,
        message: alertData.message,
        dataReference: alertData.dataReference,
      },
    });

    return alert as HealthAlert;
  }

  /**
   * 의료진과 데이터 공유 설정 (요구사항 17.4)
   */
  static async createDataShare(shareData: {
    userId: string;
    healthcareProviderEmail: string;
    healthcareProviderName?: string;
    sharedDataTypes: any;
    accessLevel: 'read_only' | 'read_write';
    startDate: Date;
    endDate?: Date;
  }): Promise<HealthcareDataShare> {
    // 액세스 토큰 생성
    const accessToken = this.generateAccessToken();

    const share = await prisma.healthcareDataShare.create({
      data: {
        userId: shareData.userId,
        healthcareProviderEmail: shareData.healthcareProviderEmail,
        healthcareProviderName: shareData.healthcareProviderName,
        sharedDataTypes: shareData.sharedDataTypes,
        accessLevel: shareData.accessLevel,
        startDate: shareData.startDate,
        endDate: shareData.endDate,
        accessToken,
      },
    });

    return share as HealthcareDataShare;
  }

  /**
   * 사용자의 활성 모니터링 세션 조회 (요구사항 17.4)
   */
  static async getActiveSession(userId: string): Promise<RemoteMonitoringSession | null> {
    const session = await prisma.remoteMonitoringSession.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return session as RemoteMonitoringSession | null;
  }

  /**
   * 실시간 건강 데이터 조회 (요구사항 17.4)
   */
  static async getRealTimeData(
    userId: string,
    dataType?: string,
    limit: number = 100
  ): Promise<RealTimeHealthData[]> {
    const data = await prisma.realTimeHealthData.findMany({
      where: {
        userId,
        ...(dataType && { dataType }),
      },
      orderBy: {
        recordedAt: 'desc',
      },
      take: limit,
    });

    return data as RealTimeHealthData[];
  }

  /**
   * 미확인 알림 조회 (요구사항 17.4)
   */
  static async getUnacknowledgedAlerts(userId: string): Promise<HealthAlert[]> {
    const alerts = await prisma.healthAlert.findMany({
      where: {
        userId,
        isAcknowledged: false,
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return alerts as HealthAlert[];
  }

  /**
   * 알림 확인 처리 (요구사항 17.4)
   */
  static async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string
  ): Promise<HealthAlert> {
    const alert = await prisma.healthAlert.update({
      where: { id: alertId },
      data: {
        isAcknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy,
      },
    });

    return alert as HealthAlert;
  }

  /**
   * 모니터링 세션 종료 (요구사항 17.4)
   */
  static async endSession(sessionId: string): Promise<RemoteMonitoringSession> {
    const session = await prisma.remoteMonitoringSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        endTime: new Date(),
      },
    });

    return session as RemoteMonitoringSession;
  }

  /**
   * 임계값 확인 (요구사항 17.4)
   */
  private static async checkCriticalThresholds(
    userId: string,
    dataType: string,
    value: any
  ): Promise<boolean> {
    // 활성 모니터링 세션의 임계값 설정 확인
    const session = await this.getActiveSession(userId);
    if (!session?.alertThresholds) {
      return false;
    }

    const thresholds = session.alertThresholds[dataType];
    if (!thresholds) {
      return false;
    }

    // 데이터 타입별 임계값 확인 로직
    switch (dataType) {
      case 'heart_rate':
        return value < thresholds.min || value > thresholds.max;
      case 'blood_pressure':
        return (
          value.systolic > thresholds.systolic_max ||
          value.diastolic > thresholds.diastolic_max ||
          value.systolic < thresholds.systolic_min ||
          value.diastolic < thresholds.diastolic_min
        );
      case 'temperature':
        return value < thresholds.min || value > thresholds.max;
      case 'oxygen_saturation':
        return value < thresholds.min;
      default:
        return false;
    }
  }

  /**
   * 액세스 토큰 생성
   */
  private static generateAccessToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * 모니터링 대시보드 데이터 조회 (요구사항 17.4)
   */
  static async getDashboardData(userId: string): Promise<{
    activeSession: RemoteMonitoringSession | null;
    recentData: RealTimeHealthData[];
    unacknowledgedAlerts: HealthAlert[];
    dataShares: HealthcareDataShare[];
  }> {
    const [activeSession, recentData, unacknowledgedAlerts, dataShares] = await Promise.all([
      this.getActiveSession(userId),
      this.getRealTimeData(userId, undefined, 50),
      this.getUnacknowledgedAlerts(userId),
      prisma.healthcareDataShare.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      activeSession,
      recentData,
      unacknowledgedAlerts,
      dataShares: dataShares as HealthcareDataShare[],
    };
  }
}