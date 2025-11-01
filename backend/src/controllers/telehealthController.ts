import { Request, Response } from 'express';
import { TelehealthIntegrationModel } from '../models/TelehealthIntegration';
import { AuthenticatedRequest } from '../middleware/auth';

export class TelehealthController {
  /**
   * 텔레헬스 플랫폼 연동 생성 (요구사항 17.5)
   */
  static async createIntegration(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { platformName, platformUserId, integrationSettings } = req.body;

      const integration = await TelehealthIntegrationModel.createIntegration({
        userId,
        platformName,
        platformUserId,
        integrationSettings,
      });

      res.status(201).json({
        message: '텔레헬스 플랫폼 연동이 생성되었습니다.',
        integration,
      });
    } catch (error) {
      console.error('Error creating telehealth integration:', error);
      res.status(500).json({
        error: '텔레헬스 플랫폼 연동 생성 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 텔레헬스 세션 생성 (요구사항 17.5)
   */
  static async createSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        telehealthIntegrationId,
        healthcareProviderName,
        sessionType,
        scheduledTime,
      } = req.body;

      // 세션 생성
      const session = await TelehealthIntegrationModel.createSession({
        userId,
        telehealthIntegrationId,
        healthcareProviderName,
        sessionType,
        scheduledTime: new Date(scheduledTime),
      });

      // 연동된 플랫폼이 있는 경우 세션 URL 생성
      let sessionUrl = null;
      if (telehealthIntegrationId) {
        const integrations = await TelehealthIntegrationModel.getUserIntegrations(userId);
        const integration = integrations.find(i => i.id === telehealthIntegrationId);
        
        if (integration) {
          sessionUrl = await TelehealthIntegrationModel.generateSessionUrl(
            session.id,
            integration.platformName,
            integration.integrationSettings
          );

          // 세션 URL 업데이트
          await TelehealthIntegrationModel.updateSessionStatus(session.id, 'scheduled', {
            actualStartTime: undefined,
            actualEndTime: undefined,
            sessionNotes: undefined,
          });
        }
      }

      res.status(201).json({
        message: '텔레헬스 세션이 생성되었습니다.',
        session: {
          ...session,
          sessionUrl,
        },
      });
    } catch (error) {
      console.error('Error creating telehealth session:', error);
      res.status(500).json({
        error: '텔레헬스 세션 생성 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 사용자의 텔레헬스 연동 목록 조회 (요구사항 17.5)
   */
  static async getUserIntegrations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const integrations = await TelehealthIntegrationModel.getUserIntegrations(userId);

      res.json({
        message: '텔레헬스 연동 목록을 조회했습니다.',
        integrations,
      });
    } catch (error) {
      console.error('Error fetching telehealth integrations:', error);
      res.status(500).json({
        error: '텔레헬스 연동 목록 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 사용자의 텔레헬스 세션 목록 조회 (요구사항 17.5)
   */
  static async getUserSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, limit } = req.query;

      const sessions = await TelehealthIntegrationModel.getUserSessions(
        userId,
        status as string,
        limit ? parseInt(limit as string) : 50
      );

      res.json({
        message: '텔레헬스 세션 목록을 조회했습니다.',
        sessions,
      });
    } catch (error) {
      console.error('Error fetching telehealth sessions:', error);
      res.status(500).json({
        error: '텔레헬스 세션 목록 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 예정된 세션 조회 (요구사항 17.5)
   */
  static async getUpcomingSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const sessions = await TelehealthIntegrationModel.getUpcomingSessions(userId);

      res.json({
        message: '예정된 텔레헬스 세션을 조회했습니다.',
        sessions,
      });
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      res.status(500).json({
        error: '예정된 세션 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 텔레헬스 세션 시작 (요구사항 17.5)
   */
  static async startSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.id;

      // 세션 소유권 확인
      const sessions = await TelehealthIntegrationModel.getUserSessions(userId);
      const session = sessions.find(s => s.id === sessionId);

      if (!session) {
        return res.status(404).json({
          error: '해당 세션을 찾을 수 없습니다.',
        });
      }

      if (session.status !== 'scheduled') {
        return res.status(400).json({
          error: '예약된 세션만 시작할 수 있습니다.',
        });
      }

      const updatedSession = await TelehealthIntegrationModel.updateSessionStatus(
        sessionId,
        'in_progress',
        {
          actualStartTime: new Date(),
        }
      );

      res.json({
        message: '텔레헬스 세션이 시작되었습니다.',
        session: updatedSession,
      });
    } catch (error) {
      console.error('Error starting telehealth session:', error);
      res.status(500).json({
        error: '텔레헬스 세션 시작 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 텔레헬스 세션 종료 (요구사항 17.5)
   */
  static async endSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;
      const { sessionNotes } = req.body;
      const userId = req.user!.id;

      // 세션 소유권 확인
      const sessions = await TelehealthIntegrationModel.getUserSessions(userId);
      const session = sessions.find(s => s.id === sessionId);

      if (!session) {
        return res.status(404).json({
          error: '해당 세션을 찾을 수 없습니다.',
        });
      }

      if (session.status !== 'in_progress') {
        return res.status(400).json({
          error: '진행 중인 세션만 종료할 수 있습니다.',
        });
      }

      const updatedSession = await TelehealthIntegrationModel.updateSessionStatus(
        sessionId,
        'completed',
        {
          actualEndTime: new Date(),
          sessionNotes,
        }
      );

      // 진료 기록 자동 동기화
      if (session.telehealthIntegrationId) {
        const integrations = await TelehealthIntegrationModel.getUserIntegrations(userId);
        const integration = integrations.find(i => i.id === session.telehealthIntegrationId);
        
        if (integration) {
          try {
            await TelehealthIntegrationModel.syncMedicalRecords(
              sessionId,
              integration.platformName,
              integration.integrationSettings
            );
          } catch (syncError) {
            console.warn('진료 기록 동기화 실패:', syncError);
          }
        }
      }

      res.json({
        message: '텔레헬스 세션이 종료되었습니다.',
        session: updatedSession,
      });
    } catch (error) {
      console.error('Error ending telehealth session:', error);
      res.status(500).json({
        error: '텔레헬스 세션 종료 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 텔레헬스 세션 취소 (요구사항 17.5)
   */
  static async cancelSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.id;

      // 세션 소유권 확인
      const sessions = await TelehealthIntegrationModel.getUserSessions(userId);
      const session = sessions.find(s => s.id === sessionId);

      if (!session) {
        return res.status(404).json({
          error: '해당 세션을 찾을 수 없습니다.',
        });
      }

      if (session.status !== 'scheduled') {
        return res.status(400).json({
          error: '예약된 세션만 취소할 수 있습니다.',
        });
      }

      const updatedSession = await TelehealthIntegrationModel.updateSessionStatus(
        sessionId,
        'cancelled'
      );

      res.json({
        message: '텔레헬스 세션이 취소되었습니다.',
        session: updatedSession,
      });
    } catch (error) {
      console.error('Error cancelling telehealth session:', error);
      res.status(500).json({
        error: '텔레헬스 세션 취소 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 텔레헬스 연동 비활성화 (요구사항 17.5)
   */
  static async deactivateIntegration(req: AuthenticatedRequest, res: Response) {
    try {
      const { integrationId } = req.params;
      const userId = req.user!.id;

      // 연동 소유권 확인
      const integrations = await TelehealthIntegrationModel.getUserIntegrations(userId);
      const integration = integrations.find(i => i.id === integrationId);

      if (!integration) {
        return res.status(404).json({
          error: '해당 연동을 찾을 수 없습니다.',
        });
      }

      const deactivatedIntegration = await TelehealthIntegrationModel.deactivateIntegration(integrationId);

      res.json({
        message: '텔레헬스 연동이 비활성화되었습니다.',
        integration: deactivatedIntegration,
      });
    } catch (error) {
      console.error('Error deactivating telehealth integration:', error);
      res.status(500).json({
        error: '텔레헬스 연동 비활성화 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 텔레헬스 통계 조회 (요구사항 17.5)
   */
  static async getTelehealthStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await TelehealthIntegrationModel.getTelehealthStats(userId);

      res.json({
        message: '텔레헬스 통계를 조회했습니다.',
        stats,
      });
    } catch (error) {
      console.error('Error fetching telehealth stats:', error);
      res.status(500).json({
        error: '텔레헬스 통계 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 지원되는 텔레헬스 플랫폼 목록 조회
   */
  static async getSupportedPlatforms(req: AuthenticatedRequest, res: Response) {
    try {
      const platforms = [
        {
          name: 'zoom_healthcare',
          displayName: 'Zoom Healthcare',
          description: 'HIPAA 준수 Zoom 화상 진료 플랫폼',
          features: ['화상 통화', '화면 공유', '진료 기록 연동'],
          setupRequired: ['API 키', '계정 설정'],
        },
        {
          name: 'teladoc',
          displayName: 'Teladoc',
          description: '글로벌 텔레헬스 플랫폼',
          features: ['24/7 진료', '전문의 상담', '처방전 발급'],
          setupRequired: ['Teladoc 계정', 'API 토큰'],
        },
        {
          name: 'amwell',
          displayName: 'Amwell',
          description: '종합 텔레헬스 솔루션',
          features: ['화상 진료', '채팅 상담', '모바일 앱'],
          setupRequired: ['Amwell 계정', '인증 토큰'],
        },
        {
          name: 'doxy_me',
          displayName: 'Doxy.me',
          description: '간편한 화상 진료 플랫폼',
          features: ['브라우저 기반', '대기실 기능', '무료 플랜'],
          setupRequired: ['Doxy.me 계정'],
        },
      ];

      res.json({
        message: '지원되는 텔레헬스 플랫폼 목록입니다.',
        platforms,
      });
    } catch (error) {
      console.error('Error fetching supported platforms:', error);
      res.status(500).json({
        error: '플랫폼 목록 조회 중 오류가 발생했습니다.',
      });
    }
  }
}