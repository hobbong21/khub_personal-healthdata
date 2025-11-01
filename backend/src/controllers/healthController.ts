import { Request, Response } from 'express';
import { HealthService } from '../services/healthService';
import { VitalSignRequest, HealthJournalRequest } from '../types/health';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class HealthController {
  /**
   * 바이탈 사인 기록 생성 (요구사항 2.1, 2.2)
   */
  static async createVitalSign(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        });
        return;
      }

      const vitalSignData: VitalSignRequest = req.body;
      const healthRecord = await HealthService.createVitalSign(userId, vitalSignData);

      res.status(201).json({
        success: true,
        data: healthRecord,
        message: '바이탈 사인이 성공적으로 기록되었습니다',
      });
    } catch (error) {
      console.error('바이탈 사인 생성 오류:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '바이탈 사인 기록 중 오류가 발생했습니다',
        },
      });
    }
  }

  /**
   * 건강 일지 기록 생성 (요구사항 3.1, 3.2, 3.3, 3.4, 3.5)
   */
  static async createHealthJournal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        });
        return;
      }

      const journalData: HealthJournalRequest = req.body;
      const healthRecord = await HealthService.createHealthJournal(userId, journalData);

      res.status(201).json({
        success: true,
        data: healthRecord,
        message: '건강 일지가 성공적으로 기록되었습니다',
      });
    } catch (error) {
      console.error('건강 일지 생성 오류:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '건강 일지 기록 중 오류가 발생했습니다',
        },
      });
    }
  }

  /**
   * 바이탈 사인 조회 (요구사항 2.1, 2.2, 2.3, 2.4)
   */
  static async getVitalSigns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        });
        return;
      }

      const { type, startDate, endDate, limit } = req.query;
      const vitalSigns = await HealthService.getVitalSigns(
        userId,
        type as string,
        startDate as string,
        endDate as string,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: vitalSigns,
        message: '바이탈 사인을 성공적으로 조회했습니다',
      });
    } catch (error) {
      console.error('바이탈 사인 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '바이탈 사인 조회 중 오류가 발생했습니다',
        },
      });
    }
  }

  /**
   * 건강 일지 조회 (요구사항 3.1, 3.2, 3.3, 3.4)
   */
  static async getHealthJournals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        });
        return;
      }

      const { startDate, endDate, limit } = req.query;
      const healthJournals = await HealthService.getHealthJournals(
        userId,
        startDate as string,
        endDate as string,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: healthJournals,
        message: '건강 일지를 성공적으로 조회했습니다',
      });
    } catch (error) {
      console.error('건강 일지 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '건강 일지 조회 중 오류가 발생했습니다',
        },
      });
    }
  }

  /**
   * 바이탈 사인 트렌드 분석 (요구사항 2.3, 2.4)
   */
  static async getVitalSignTrends(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        });
        return;
      }

      const { type, period, days } = req.query;
      
      if (!type) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '바이탈 사인 타입이 필요합니다',
          },
        });
        return;
      }

      const trends = await HealthService.getVitalSignTrends(
        userId,
        type as string,
        (period as 'daily' | 'weekly' | 'monthly') || 'daily',
        days ? parseInt(days as string) : undefined
      );

      res.json({
        success: true,
        data: trends,
        message: '바이탈 사인 트렌드를 성공적으로 분석했습니다',
      });
    } catch (error) {
      console.error('바이탈 사인 트렌드 분석 오류:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '바이탈 사인 트렌드 분석 중 오류가 발생했습니다',
        },
      });
    }
  }

  /**
   * 건강 기록 업데이트 (요구사항 2.5)
   */
  static async updateHealthRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        });
        return;
      }

      const { recordId } = req.params;
      const updateData = req.body;

      const updatedRecord = await HealthService.updateHealthRecord(userId, recordId, updateData);

      res.json({
        success: true,
        data: updatedRecord,
        message: '건강 기록이 성공적으로 업데이트되었습니다',
      });
    } catch (error) {
      console.error('건강 기록 업데이트 오류:', error);
      
      if (error instanceof Error && error.message.includes('찾을 수 없거나 접근 권한이 없습니다')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '건강 기록 업데이트 중 오류가 발생했습니다',
        },
      });
    }
  }

  /**
   * 건강 기록 삭제
   */
  static async deleteHealthRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        });
        return;
      }

      const { recordId } = req.params;
      await HealthService.deleteHealthRecord(userId, recordId);

      res.json({
        success: true,
        message: '건강 기록이 성공적으로 삭제되었습니다',
      });
    } catch (error) {
      console.error('건강 기록 삭제 오류:', error);
      
      if (error instanceof Error && error.message.includes('찾을 수 없거나 접근 권한이 없습니다')) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: error.message,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '건강 기록 삭제 중 오류가 발생했습니다',
        },
      });
    }
  }

  /**
   * 건강 데이터 대시보드 요약
   */
  static async getHealthSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        });
        return;
      }

      // 최근 30일간의 데이터 요약
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [recentVitalSigns, recentJournals] = await Promise.all([
        HealthService.getVitalSigns(userId, undefined, thirtyDaysAgo.toISOString(), undefined, 100),
        HealthService.getHealthJournals(userId, thirtyDaysAgo.toISOString(), undefined, 30),
      ]);

      // 바이탈 사인별 최신 값
      const latestVitalSigns: { [key: string]: any } = {};
      recentVitalSigns.forEach(record => {
        const data = record.data as any;
        if (!latestVitalSigns[data.type] || 
            new Date(record.recordedDate) > new Date(latestVitalSigns[data.type].recordedDate)) {
          latestVitalSigns[data.type] = {
            value: data.value,
            unit: data.unit,
            recordedDate: record.recordedDate,
          };
        }
      });

      // 건강 일지 평균 컨디션
      const conditionRatings = recentJournals
        .map(journal => (journal.data as any).conditionRating)
        .filter(rating => typeof rating === 'number');
      
      const averageCondition = conditionRatings.length > 0 
        ? conditionRatings.reduce((sum, rating) => sum + rating, 0) / conditionRatings.length
        : null;

      res.json({
        success: true,
        data: {
          latestVitalSigns,
          averageCondition: averageCondition ? Math.round(averageCondition * 10) / 10 : null,
          totalRecords: recentVitalSigns.length + recentJournals.length,
          period: '30일',
        },
        message: '건강 데이터 요약을 성공적으로 조회했습니다',
      });
    } catch (error) {
      console.error('건강 데이터 요약 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '건강 데이터 요약 조회 중 오류가 발생했습니다',
        },
      });
    }
  }

  /**
   * 대시보드 종합 데이터 조회 (요구사항 4.1, 4.2, 4.3)
   */
  static async getDashboardData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        });
        return;
      }

      const dashboardData = await HealthService.getDashboardSummary(userId);

      res.json({
        success: true,
        data: dashboardData,
        message: '대시보드 데이터를 성공적으로 조회했습니다',
      });
    } catch (error) {
      console.error('대시보드 데이터 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '대시보드 데이터 조회 중 오류가 발생했습니다',
        },
      });
    }
  }

  /**
   * 건강 지표 트렌드 분석 (요구사항 4.1, 4.2)
   */
  static async getHealthTrends(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        });
        return;
      }

      const { period = 'monthly', days = 30 } = req.query;
      const vitalSignTypes = ['weight', 'blood_pressure', 'heart_rate', 'blood_sugar'];

      // 각 바이탈 사인 타입별 트렌드 분석
      const trendPromises = vitalSignTypes.map(type =>
        HealthService.getVitalSignTrends(
          userId,
          type,
          period as 'daily' | 'weekly' | 'monthly',
          parseInt(days as string)
        ).catch(() => null) // 데이터가 없는 경우 null 반환
      );

      const trends = await Promise.all(trendPromises);
      const validTrends = trends.filter(trend => trend !== null);

      res.json({
        success: true,
        data: {
          trends: validTrends,
          period,
          days: parseInt(days as string),
        },
        message: '건강 지표 트렌드를 성공적으로 분석했습니다',
      });
    } catch (error) {
      console.error('건강 지표 트렌드 분석 오류:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '건강 지표 트렌드 분석 중 오류가 발생했습니다',
        },
      });
    }
  }

  /**
   * 목표 달성률 조회 (요구사항 4.3)
   */
  static async getGoalProgress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '인증이 필요합니다',
          },
        });
        return;
      }

      const dashboardData = await HealthService.getDashboardSummary(userId);

      res.json({
        success: true,
        data: {
          goals: dashboardData.goals,
          trends: dashboardData.trends,
        },
        message: '목표 달성률을 성공적으로 조회했습니다',
      });
    } catch (error) {
      console.error('목표 달성률 조회 오류:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '목표 달성률 조회 중 오류가 발생했습니다',
        },
      });
    }
  }
}