import { Request, Response } from 'express';
import { IncentiveManagementModel } from '../models/IncentiveManagement';
import { AuthenticatedRequest } from '../middleware/auth';

export class IncentiveManagementController {
  /**
   * 데이터 기여도 계산 (요구사항 16.4)
   */
  static async calculateDataContribution(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { dataType, startDate, endDate } = req.query;

      if (!dataType || !startDate || !endDate) {
        return res.status(400).json({
          error: '데이터 타입, 시작 날짜, 종료 날짜는 필수입니다.',
        });
      }

      const timeRange = {
        start: new Date(startDate as string),
        end: new Date(endDate as string),
      };

      const contribution = await IncentiveManagementModel.calculateDataContribution(
        userId,
        dataType as string,
        timeRange
      );

      res.json({
        message: '데이터 기여도가 계산되었습니다.',
        contribution,
      });
    } catch (error) {
      console.error('Error calculating data contribution:', error);
      res.status(500).json({
        error: '데이터 기여도 계산 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 사용자 인센티브 대시보드 (요구사항 16.4)
   */
  static async getUserIncentiveDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const dashboard = await IncentiveManagementModel.getUserIncentiveDashboard(userId);

      res.json({
        message: '인센티브 대시보드 데이터를 조회했습니다.',
        dashboard,
      });
    } catch (error) {
      console.error('Error fetching incentive dashboard:', error);
      res.status(500).json({
        error: '인센티브 대시보드 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 인센티브 규칙 처리 (요구사항 16.4)
   */
  static async processUserIncentives(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const transactions = await IncentiveManagementModel.processIncentiveRules(userId);

      res.json({
        message: '인센티브 규칙이 처리되었습니다.',
        transactions,
        totalPointsEarned: transactions.reduce((sum, t) => sum + t.points, 0),
      });
    } catch (error) {
      console.error('Error processing user incentives:', error);
      res.status(500).json({
        error: '인센티브 처리 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 전체 인센티브 지급 처리 (관리자용)
   */
  static async processAllIncentivePayments(req: AuthenticatedRequest, res: Response) {
    try {
      // 관리자 권한 확인
      const userRole = req.user?.role || 'user';
      if (userRole !== 'admin') {
        return res.status(403).json({
          error: '관리자 권한이 필요합니다.',
        });
      }

      const result = await IncentiveManagementModel.processIncentivePayments();

      res.json({
        message: '전체 인센티브 지급이 처리되었습니다.',
        ...result,
      });
    } catch (error) {
      console.error('Error processing all incentive payments:', error);
      res.status(500).json({
        error: '인센티브 지급 처리 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 인센티브 통계 조회 (관리자용)
   */
  static async getIncentiveStats(req: AuthenticatedRequest, res: Response) {
    try {
      // 관리자 권한 확인
      const userRole = req.user?.role || 'user';
      if (userRole !== 'admin') {
        return res.status(403).json({
          error: '관리자 권한이 필요합니다.',
        });
      }

      const stats = await IncentiveManagementModel.getIncentiveStats();

      res.json({
        message: '인센티브 통계를 조회했습니다.',
        stats,
      });
    } catch (error) {
      console.error('Error fetching incentive stats:', error);
      res.status(500).json({
        error: '인센티브 통계 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 데이터 품질 분석
   */
  static async analyzeDataQuality(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { period } = req.query; // 'daily', 'weekly', 'monthly'

      let startDate: Date;
      const endDate = new Date();

      switch (period) {
        case 'daily':
          startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
        default:
          startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // 각 데이터 타입별 품질 분석
      const dataTypes = ['vital_signs', 'health_records', 'medical_records', 'wearable_data'];
      const qualityAnalysis = [];

      for (const dataType of dataTypes) {
        try {
          const contribution = await IncentiveManagementModel.calculateDataContribution(
            userId,
            dataType,
            { start: startDate, end: endDate }
          );

          qualityAnalysis.push({
            dataType,
            recordCount: contribution.recordCount,
            qualityScore: contribution.qualityScore,
            pointsEarned: contribution.pointsEarned,
            period: period || 'monthly',
          });
        } catch (error) {
          console.warn(`Error analyzing ${dataType}:`, error);
          qualityAnalysis.push({
            dataType,
            recordCount: 0,
            qualityScore: 0,
            pointsEarned: 0,
            period: period || 'monthly',
            error: 'Analysis failed',
          });
        }
      }

      // 전체 품질 점수 계산
      const totalRecords = qualityAnalysis.reduce((sum, analysis) => sum + analysis.recordCount, 0);
      const weightedQualityScore = totalRecords > 0 
        ? qualityAnalysis.reduce((sum, analysis) => 
            sum + (analysis.qualityScore * analysis.recordCount), 0) / totalRecords
        : 0;

      // 개선 권장사항 생성
      const recommendations = this.generateQualityRecommendations(qualityAnalysis);

      res.json({
        message: '데이터 품질 분석이 완료되었습니다.',
        analysis: {
          period: period || 'monthly',
          overallQuality: Math.round(weightedQualityScore * 100) / 100,
          totalRecords,
          dataTypeAnalysis: qualityAnalysis,
          recommendations,
        },
      });
    } catch (error) {
      console.error('Error analyzing data quality:', error);
      res.status(500).json({
        error: '데이터 품질 분석 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 품질 개선 권장사항 생성
   */
  private static generateQualityRecommendations(qualityAnalysis: any[]): any[] {
    const recommendations = [];

    qualityAnalysis.forEach(analysis => {
      if (analysis.qualityScore < 70) {
        recommendations.push({
          type: 'quality_improvement',
          dataType: analysis.dataType,
          priority: 'high',
          message: `${analysis.dataType} 데이터의 품질이 낮습니다. 더 정확하고 완전한 데이터를 입력해주세요.`,
          expectedImprovement: '품질 개선 시 추가 포인트 획득 가능',
        });
      }

      if (analysis.recordCount < 10) {
        recommendations.push({
          type: 'data_frequency',
          dataType: analysis.dataType,
          priority: 'medium',
          message: `${analysis.dataType} 데이터를 더 자주 기록해주세요. 일관된 기록이 더 많은 포인트를 제공합니다.`,
          expectedImprovement: '기록 빈도 증가 시 보너스 포인트 획득',
        });
      }
    });

    // 전반적인 권장사항
    const totalQuality = qualityAnalysis.reduce((sum, a) => sum + a.qualityScore, 0) / qualityAnalysis.length;
    if (totalQuality > 85) {
      recommendations.push({
        type: 'achievement',
        priority: 'positive',
        message: '훌륭한 데이터 품질을 유지하고 있습니다! 지속적인 기록으로 더 많은 인센티브를 받으세요.',
        expectedImprovement: '고품질 데이터 유지 시 프리미엄 보너스 제공',
      });
    }

    return recommendations;
  }

  /**
   * 인센티브 예측
   */
  static async predictIncentives(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { targetPeriod } = req.query; // 'week', 'month'

      // 과거 데이터 기반 예측
      const historicalData = await this.getHistoricalIncentiveData(userId);
      const prediction = this.calculateIncentivePrediction(historicalData, targetPeriod as string);

      res.json({
        message: '인센티브 예측이 완료되었습니다.',
        prediction,
      });
    } catch (error) {
      console.error('Error predicting incentives:', error);
      res.status(500).json({
        error: '인센티브 예측 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 과거 인센티브 데이터 조회
   */
  private static async getHistoricalIncentiveData(userId: string): Promise<any[]> {
    // 실제 구현에서는 과거 30일간의 인센티브 데이터 조회
    return [
      { date: '2024-01-01', points: 150, activities: 5 },
      { date: '2024-01-02', points: 200, activities: 7 },
      // ... 더 많은 데이터
    ];
  }

  /**
   * 인센티브 예측 계산
   */
  private static calculateIncentivePrediction(historicalData: any[], targetPeriod: string): any {
    const avgDailyPoints = historicalData.reduce((sum, data) => sum + data.points, 0) / historicalData.length;
    const avgDailyActivities = historicalData.reduce((sum, data) => sum + data.activities, 0) / historicalData.length;

    const daysInPeriod = targetPeriod === 'week' ? 7 : 30;
    const predictedPoints = Math.round(avgDailyPoints * daysInPeriod);
    const predictedActivities = Math.round(avgDailyActivities * daysInPeriod);

    return {
      period: targetPeriod,
      predictedPoints,
      predictedActivities,
      confidence: 0.75, // 75% 신뢰도
      breakdown: {
        dailyAverage: Math.round(avgDailyPoints),
        weeklyProjection: Math.round(avgDailyPoints * 7),
        monthlyProjection: Math.round(avgDailyPoints * 30),
      },
      recommendations: [
        {
          action: '일일 바이탈 사인 3회 기록',
          expectedPoints: 50,
          frequency: 'daily',
        },
        {
          action: '주간 운동 목표 달성',
          expectedPoints: 200,
          frequency: 'weekly',
        },
      ],
    };
  }

  /**
   * 리더보드 조회
   */
  static async getLeaderboard(req: AuthenticatedRequest, res: Response) {
    try {
      const { period, category } = req.query; // period: 'weekly', 'monthly', 'all-time'
      
      // 실제 구현에서는 데이터베이스에서 리더보드 데이터 조회
      const leaderboard = [
        {
          rank: 1,
          userId: 'user_001',
          username: '건강왕',
          points: 5420,
          activities: 156,
          streak: 28, // 연속 기록 일수
        },
        {
          rank: 2,
          userId: 'user_002',
          username: '데이터마스터',
          points: 4890,
          activities: 142,
          streak: 21,
        },
        {
          rank: 3,
          userId: 'user_003',
          username: '헬스케어러',
          points: 4320,
          activities: 128,
          streak: 15,
        },
      ];

      // 현재 사용자 순위 찾기
      const userId = req.user!.id;
      const userRank = leaderboard.find(entry => entry.userId === userId) || {
        rank: 45,
        userId,
        username: '나',
        points: 1250,
        activities: 38,
        streak: 7,
      };

      res.json({
        message: '리더보드를 조회했습니다.',
        leaderboard: {
          period: period || 'monthly',
          category: category || 'overall',
          topUsers: leaderboard.slice(0, 10),
          userRank,
          totalParticipants: 1247,
        },
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({
        error: '리더보드 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 인센티브 규칙 조회
   */
  static async getIncentiveRules(req: AuthenticatedRequest, res: Response) {
    try {
      const rules = [
        {
          id: 'daily_vitals',
          name: '일일 바이탈 사인 기록',
          description: '하루에 3회 이상 바이탈 사인을 기록하면 50포인트를 획득합니다.',
          category: 'daily_activity',
          points: 50,
          requirements: ['바이탈 사인 3회 이상 기록'],
          frequency: 'daily',
          maxPointsPerDay: 50,
          isActive: true,
        },
        {
          id: 'weekly_exercise',
          name: '주간 운동 목표 달성',
          description: '일주일에 5회 이상 운동을 기록하면 200포인트를 획득합니다.',
          category: 'weekly_goal',
          points: 200,
          requirements: ['주 5회 이상 운동 기록'],
          frequency: 'weekly',
          maxPointsPerMonth: 800,
          isActive: true,
        },
        {
          id: 'data_quality_bonus',
          name: '고품질 데이터 기여',
          description: '데이터 품질 점수 90점 이상 달성 시 500포인트 보너스를 받습니다.',
          category: 'quality_bonus',
          points: 500,
          requirements: ['데이터 품질 점수 90점 이상'],
          frequency: 'monthly',
          maxPointsPerMonth: 1500,
          isActive: true,
        },
        {
          id: 'research_participation',
          name: '연구 참여 완료',
          description: '연구 프로젝트 참여를 완료하면 1000포인트를 획득합니다.',
          category: 'milestone',
          points: 1000,
          requirements: ['연구 프로젝트 참여 완료'],
          frequency: 'event',
          isActive: true,
        },
      ];

      res.json({
        message: '인센티브 규칙을 조회했습니다.',
        rules,
      });
    } catch (error) {
      console.error('Error fetching incentive rules:', error);
      res.status(500).json({
        error: '인센티브 규칙 조회 중 오류가 발생했습니다.',
      });
    }
  }
}