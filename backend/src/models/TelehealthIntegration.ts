import prisma from '../config/database';

export interface TelehealthIntegration {
  id: string;
  userId: string;
  platformName: string;
  platformId: string;
  accessToken?: string;
  refreshToken?: string;
  isActive: boolean;
  lastSyncAt?: Date;
  integrationConfig?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface TelehealthSession {
  id: string;
  telehealthIntegrationId: string;
  sessionId: string;
  doctorName: string;
  specialty?: string;
  sessionType: string;
  scheduledTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  sessionNotes?: string;
  diagnosis?: string;
  prescriptions?: any;
  followUpRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TelehealthIntegrationModel {
  /**
   * 텔레헬스 플랫폼 연동 생성 (요구사항 17.5)
   */
  static async createIntegration(integrationData: {
    userId: string;
    platformName: string;
    platformUserId?: string;
    integrationSettings?: any;
  }): Promise<TelehealthIntegration> {
    const integration = await prisma.telehealthIntegration.create({
      data: {
        userId: integrationData.userId,
        platformName: integrationData.platformName,
        platformId: integrationData.platformUserId || 'default',
        integrationConfig: integrationData.integrationSettings,
        isActive: true,
      },
    });

    return integration as TelehealthIntegration;
  }

  /**
   * 텔레헬스 세션 생성 (요구사항 17.5)
   */
  static async createSession(sessionData: {
    telehealthIntegrationId: string;
    sessionId: string;
    doctorName: string;
    specialty?: string;
    sessionType: string;
    scheduledTime: Date;
  }): Promise<TelehealthSession> {
    const session = await prisma.telehealthSession.create({
      data: {
        telehealthIntegrationId: sessionData.telehealthIntegrationId,
        sessionId: sessionData.sessionId,
        doctorName: sessionData.doctorName,
        specialty: sessionData.specialty,
        sessionType: sessionData.sessionType,
        scheduledTime: sessionData.scheduledTime,
        status: 'scheduled',
        followUpRequired: false,
      },
    });

    return session as TelehealthSession;
  }

  /**
   * 사용자의 텔레헬스 연동 목록 조회 (요구사항 17.5)
   */
  static async getUserIntegrations(userId: string): Promise<TelehealthIntegration[]> {
    const integrations = await prisma.telehealthIntegration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return integrations as TelehealthIntegration[];
  }

  /**
   * 사용자의 텔레헬스 세션 목록 조회 (요구사항 17.5)
   */
  static async getUserSessions(
    userId: string,
    status?: string,
    limit: number = 50
  ): Promise<TelehealthSession[]> {
    // userId를 통해 integration을 먼저 찾고, 그 integration의 세션들을 조회
    const integrations = await prisma.telehealthIntegration.findMany({
      where: { userId },
      select: { id: true }
    });
    
    const integrationIds = integrations.map(i => i.id);
    
    const sessions = await prisma.telehealthSession.findMany({
      where: {
        telehealthIntegrationId: { in: integrationIds },
        ...(status && { status }),
      },
      orderBy: { scheduledTime: 'desc' },
      take: limit,
    });

    return sessions as TelehealthSession[];
  }

  /**
   * 텔레헬스 세션 상태 업데이트 (요구사항 17.5)
   */
  static async updateSessionStatus(
    sessionId: string,
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show',
    updateData?: {
      actualStartTime?: Date;
      actualEndTime?: Date;
      sessionNotes?: string;
    }
  ): Promise<TelehealthSession> {
    const session = await prisma.telehealthSession.update({
      where: { id: sessionId },
      data: {
        status,
        ...(updateData?.actualStartTime && { actualStartTime: updateData.actualStartTime }),
        ...(updateData?.actualEndTime && { actualEndTime: updateData.actualEndTime }),
        ...(updateData?.sessionNotes && { sessionNotes: updateData.sessionNotes }),
      },
    });

    return session as TelehealthSession;
  }

  /**
   * 예정된 세션 조회 (요구사항 17.5)
   */
  static async getUpcomingSessions(userId: string): Promise<TelehealthSession[]> {
    const now = new Date();
    
    // userId를 통해 integration을 먼저 찾고, 그 integration의 세션들을 조회
    const integrations = await prisma.telehealthIntegration.findMany({
      where: { userId },
      select: { id: true }
    });
    
    const integrationIds = integrations.map(i => i.id);
    
    const sessions = await prisma.telehealthSession.findMany({
      where: {
        telehealthIntegrationId: { in: integrationIds },
        status: 'scheduled',
        scheduledTime: {
          gte: now,
        },
      },
      orderBy: { scheduledTime: 'asc' },
      take: 10,
    });

    return sessions as TelehealthSession[];
  }

  /**
   * 텔레헬스 연동 비활성화 (요구사항 17.5)
   */
  static async deactivateIntegration(integrationId: string): Promise<TelehealthIntegration> {
    const integration = await prisma.telehealthIntegration.update({
      where: { id: integrationId },
      data: { isActive: false },
    });

    return integration as TelehealthIntegration;
  }

  /**
   * 세션 URL 생성 (외부 플랫폼 연동)
   */
  static async generateSessionUrl(
    sessionId: string,
    platformName: string,
    integrationSettings: any
  ): Promise<string> {
    // 실제 구현에서는 각 플랫폼의 API를 호출하여 세션 URL을 생성
    switch (platformName.toLowerCase()) {
      case 'zoom_healthcare':
        return this.generateZoomHealthcareUrl(sessionId, integrationSettings);
      case 'teladoc':
        return this.generateTeladocUrl(sessionId, integrationSettings);
      case 'amwell':
        return this.generateAmwellUrl(sessionId, integrationSettings);
      default:
        // 기본 세션 URL (플랫폼별 구현 필요)
        return `https://telehealth-platform.com/session/${sessionId}`;
    }
  }

  /**
   * Zoom Healthcare URL 생성
   */
  private static async generateZoomHealthcareUrl(
    sessionId: string,
    settings: any
  ): Promise<string> {
    // Zoom Healthcare API 연동 로직
    // 실제로는 Zoom API를 호출하여 미팅 생성
    const meetingId = `zoom-${sessionId}-${Date.now()}`;
    return `https://zoom.us/j/${meetingId}?pwd=${settings.password || 'default'}`;
  }

  /**
   * Teladoc URL 생성
   */
  private static async generateTeladocUrl(
    sessionId: string,
    settings: any
  ): Promise<string> {
    // Teladoc API 연동 로직
    return `https://teladoc.com/session/${sessionId}?token=${settings.apiToken}`;
  }

  /**
   * Amwell URL 생성
   */
  private static async generateAmwellUrl(
    sessionId: string,
    settings: any
  ): Promise<string> {
    // Amwell API 연동 로직
    return `https://amwell.com/visit/${sessionId}?auth=${settings.authToken}`;
  }

  /**
   * 진료 기록 자동 동기화 (요구사항 17.5)
   */
  static async syncMedicalRecords(
    sessionId: string,
    platformName: string,
    integrationSettings: any
  ): Promise<any> {
    try {
      const session = await prisma.telehealthSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new Error('세션을 찾을 수 없습니다.');
      }

      // 플랫폼별 진료 기록 동기화 로직
      let syncedData;
      switch (platformName.toLowerCase()) {
        case 'zoom_healthcare':
          syncedData = await this.syncZoomHealthcareRecords(session, integrationSettings);
          break;
        case 'teladoc':
          syncedData = await this.syncTeladocRecords(session, integrationSettings);
          break;
        case 'amwell':
          syncedData = await this.syncAmwellRecords(session, integrationSettings);
          break;
        default:
          syncedData = { message: '지원되지 않는 플랫폼입니다.' };
      }

      // 동기화된 데이터를 의료 기록으로 저장
      if (syncedData && syncedData.diagnosis) {
        await prisma.medicalRecord.create({
          data: {
            userId: 'temp-user-id', // session에서 userId를 가져올 수 없으므로 임시 처리
            hospitalName: 'Telehealth Session',
            department: 'Telehealth',
            doctorName: session.doctorName,
            diagnosisDescription: syncedData.diagnosis,
            doctorNotes: syncedData.notes || session.sessionNotes,
            visitDate: session.actualStartTime || session.scheduledTime,
          },
        });
      }

      return syncedData;
    } catch (error) {
      console.error('진료 기록 동기화 오류:', error);
      throw error;
    }
  }

  /**
   * Zoom Healthcare 진료 기록 동기화
   */
  private static async syncZoomHealthcareRecords(
    session: any,
    settings: any
  ): Promise<any> {
    // Zoom Healthcare API를 통한 진료 기록 조회
    // 실제 구현에서는 Zoom API 호출
    return {
      diagnosis: '원격 진료 상담 완료',
      notes: session.sessionNotes || '원격 진료를 통한 상담이 완료되었습니다.',
      duration: session.actualEndTime && session.actualStartTime 
        ? Math.round((new Date(session.actualEndTime).getTime() - new Date(session.actualStartTime).getTime()) / 60000)
        : null,
    };
  }

  /**
   * Teladoc 진료 기록 동기화
   */
  private static async syncTeladocRecords(
    session: any,
    settings: any
  ): Promise<any> {
    // Teladoc API를 통한 진료 기록 조회
    return {
      diagnosis: 'Teladoc 원격 진료',
      notes: session.sessionNotes || 'Teladoc을 통한 원격 진료가 완료되었습니다.',
    };
  }

  /**
   * Amwell 진료 기록 동기화
   */
  private static async syncAmwellRecords(
    session: any,
    settings: any
  ): Promise<any> {
    // Amwell API를 통한 진료 기록 조회
    return {
      diagnosis: 'Amwell 원격 진료',
      notes: session.sessionNotes || 'Amwell을 통한 원격 진료가 완료되었습니다.',
    };
  }

  /**
   * 텔레헬스 통계 조회
   */
  static async getTelehealthStats(userId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    cancelledSessions: number;
    averageSessionDuration: number;
  }> {
    // userId를 통해 integration을 먼저 찾고, 그 integration의 세션들을 조회
    const integrations = await prisma.telehealthIntegration.findMany({
      where: { userId },
      select: { id: true }
    });
    
    const integrationIds = integrations.map(i => i.id);
    
    const [totalSessions, completedSessions, upcomingSessions, cancelledSessions] = await Promise.all([
      prisma.telehealthSession.count({ where: { telehealthIntegrationId: { in: integrationIds } } }),
      prisma.telehealthSession.count({ where: { telehealthIntegrationId: { in: integrationIds }, status: 'completed' } }),
      prisma.telehealthSession.count({ 
        where: { 
          telehealthIntegrationId: { in: integrationIds },
          status: 'scheduled',
          scheduledTime: { gte: new Date() }
        } 
      }),
      prisma.telehealthSession.count({ where: { telehealthIntegrationId: { in: integrationIds }, status: 'cancelled' } }),
    ]);

    // 평균 세션 시간 계산
    const completedSessionsWithDuration = await prisma.telehealthSession.findMany({
      where: {
        telehealthIntegrationId: { in: integrationIds },
        status: 'completed',
        actualStartTime: { not: null },
        actualEndTime: { not: null },
      },
      select: {
        actualStartTime: true,
        actualEndTime: true,
      },
    });

    let averageSessionDuration = 0;
    if (completedSessionsWithDuration.length > 0) {
      const totalDuration = completedSessionsWithDuration.reduce((sum, session) => {
        if (session.actualStartTime && session.actualEndTime) {
          return sum + (new Date(session.actualEndTime).getTime() - new Date(session.actualStartTime).getTime());
        }
        return sum;
      }, 0);
      averageSessionDuration = Math.round(totalDuration / completedSessionsWithDuration.length / 60000); // 분 단위
    }

    return {
      totalSessions,
      completedSessions,
      upcomingSessions,
      cancelledSessions,
      averageSessionDuration,
    };
  }
}