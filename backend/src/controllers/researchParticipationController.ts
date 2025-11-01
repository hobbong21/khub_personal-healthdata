import { Request, Response } from 'express';
import { ResearchParticipationModel } from '../models/ResearchParticipation';
import { AuthenticatedRequest } from '../middleware/auth';

export class ResearchParticipationController {
  /**
   * 연구 프로젝트 매칭 (요구사항 16.2)
   */
  static async getMatchedResearchProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const matchedProjects = await ResearchParticipationModel.matchResearchProjects(userId);

      res.json({
        message: '매칭된 연구 프로젝트를 조회했습니다.',
        projects: matchedProjects,
        totalMatched: matchedProjects.length,
      });
    } catch (error) {
      console.error('Error matching research projects:', error);
      res.status(500).json({
        error: '연구 프로젝트 매칭 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 연구 참여 신청 (요구사항 16.3)
   */
  static async applyForResearch(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { researchProjectId, consentGiven } = req.body;

      if (!consentGiven) {
        return res.status(400).json({
          error: '연구 참여를 위해서는 동의가 필요합니다.',
        });
      }

      const participation = await ResearchParticipationModel.applyForResearch(
        userId,
        researchProjectId,
        consentGiven
      );

      res.status(201).json({
        message: '연구 참여 신청이 완료되었습니다.',
        participation,
      });
    } catch (error) {
      console.error('Error applying for research:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('이미 참여')) {
          return res.status(409).json({ error: error.message });
        }
        if (error.message.includes('찾을 수 없습니다') || error.message.includes('모집 중이지 않은')) {
          return res.status(404).json({ error: error.message });
        }
      }

      res.status(500).json({
        error: '연구 참여 신청 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 사용자의 연구 참여 현황 조회 (요구사항 16.5)
   */
  static async getUserParticipations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status } = req.query;

      const participations = await ResearchParticipationModel.getUserParticipations(
        userId,
        status as string
      );

      res.json({
        message: '연구 참여 현황을 조회했습니다.',
        participations,
        totalCount: participations.length,
      });
    } catch (error) {
      console.error('Error fetching user participations:', error);
      res.status(500).json({
        error: '연구 참여 현황 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 연구 결과 피드백 조회 (요구사항 16.5)
   */
  static async getResearchFeedback(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { participationId } = req.params;

      const feedback = await ResearchParticipationModel.getResearchFeedback(
        userId,
        participationId
      );

      res.json({
        message: '연구 결과 피드백을 조회했습니다.',
        ...feedback,
      });
    } catch (error) {
      console.error('Error fetching research feedback:', error);
      
      if (error instanceof Error && error.message.includes('찾을 수 없습니다')) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({
        error: '연구 결과 피드백 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 연구 참여 철회
   */
  static async withdrawFromResearch(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { participationId } = req.params;
      const { reason } = req.body;

      // 참여 기록 확인
      const participations = await ResearchParticipationModel.getUserParticipations(userId);
      const participation = participations.find(p => p.id === participationId);

      if (!participation) {
        return res.status(404).json({
          error: '연구 참여 기록을 찾을 수 없습니다.',
        });
      }

      if (participation.status === 'withdrawn' || participation.status === 'completed') {
        return res.status(400).json({
          error: '이미 철회되었거나 완료된 연구입니다.',
        });
      }

      const updatedParticipation = await ResearchParticipationModel.updateParticipationStatus(
        participationId,
        'withdrawn',
        undefined,
        new Date()
      );

      res.json({
        message: '연구 참여가 철회되었습니다.',
        participation: updatedParticipation,
      });
    } catch (error) {
      console.error('Error withdrawing from research:', error);
      res.status(500).json({
        error: '연구 참여 철회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 사용자 인센티브 현황 조회 (요구사항 16.4)
   */
  static async getUserIncentives(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const incentiveStatus = await ResearchParticipationModel.getUserIncentives(userId);

      res.json({
        message: '인센티브 현황을 조회했습니다.',
        ...incentiveStatus,
      });
    } catch (error) {
      console.error('Error fetching user incentives:', error);
      res.status(500).json({
        error: '인센티브 현황 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 인센티브 포인트 사용 (요구사항 16.4)
   */
  static async redeemIncentivePoints(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { points, redeemType, description } = req.body;

      if (points <= 0) {
        return res.status(400).json({
          error: '사용할 포인트는 0보다 커야 합니다.',
        });
      }

      const result = await ResearchParticipationModel.redeemIncentivePoints(
        userId,
        points,
        redeemType,
        description
      );

      res.json({
        message: '인센티브 포인트가 사용되었습니다.',
        ...result,
      });
    } catch (error) {
      console.error('Error redeeming incentive points:', error);
      
      if (error instanceof Error && error.message.includes('부족합니다')) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({
        error: '인센티브 포인트 사용 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 인센티브 포인트 지급 (관리자/연구진용)
   */
  static async awardIncentivePoints(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId, incentiveType, points, description, referenceId } = req.body;

      // 관리자 권한 확인 (실제 구현에서는 역할 기반 접근 제어)
      const userRole = req.user?.role || 'user';
      if (userRole !== 'admin' && userRole !== 'researcher') {
        return res.status(403).json({
          error: '관리자 또는 연구진 권한이 필요합니다.',
        });
      }

      const incentive = await ResearchParticipationModel.awardIncentivePoints(
        userId,
        incentiveType,
        points,
        description,
        referenceId
      );

      res.status(201).json({
        message: '인센티브 포인트가 지급되었습니다.',
        incentive,
      });
    } catch (error) {
      console.error('Error awarding incentive points:', error);
      res.status(500).json({
        error: '인센티브 포인트 지급 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 연구 참여 승인/거부 (연구진용)
   */
  static async updateParticipationStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { participationId } = req.params;
      const { status, startDate, endDate } = req.body;

      // 연구진 권한 확인
      const userRole = req.user?.role || 'user';
      if (userRole !== 'admin' && userRole !== 'researcher') {
        return res.status(403).json({
          error: '연구진 권한이 필요합니다.',
        });
      }

      const participation = await ResearchParticipationModel.updateParticipationStatus(
        participationId,
        status,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      res.json({
        message: '연구 참여 상태가 업데이트되었습니다.',
        participation,
      });
    } catch (error) {
      console.error('Error updating participation status:', error);
      res.status(500).json({
        error: '연구 참여 상태 업데이트 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 연구 참여 통계 조회 (관리자용)
   */
  static async getResearchStats(req: AuthenticatedRequest, res: Response) {
    try {
      // 관리자 권한 확인
      const userRole = req.user?.role || 'user';
      if (userRole !== 'admin') {
        return res.status(403).json({
          error: '관리자 권한이 필요합니다.',
        });
      }

      const stats = await ResearchParticipationModel.getResearchStats();

      res.json({
        message: '연구 참여 통계를 조회했습니다.',
        stats,
      });
    } catch (error) {
      console.error('Error fetching research stats:', error);
      res.status(500).json({
        error: '연구 참여 통계 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 인센티브 사용 가능 항목 조회
   */
  static async getRedeemableItems(req: AuthenticatedRequest, res: Response) {
    try {
      const redeemableItems = [
        {
          id: 'health_checkup_voucher',
          name: '건강검진 바우처',
          description: '종합건강검진 50% 할인 바우처',
          pointsCost: 1000,
          category: 'healthcare',
          availability: 'available',
          expiryDays: 90,
        },
        {
          id: 'fitness_tracker',
          name: '피트니스 트래커',
          description: '스마트 피트니스 밴드',
          pointsCost: 2500,
          category: 'device',
          availability: 'limited',
          stock: 15,
        },
        {
          id: 'nutrition_consultation',
          name: '영양 상담',
          description: '전문 영양사와의 1:1 상담 (1시간)',
          pointsCost: 800,
          category: 'consultation',
          availability: 'available',
        },
        {
          id: 'genetic_test_kit',
          name: '유전자 검사 키트',
          description: '개인 맞춤형 유전자 분석 키트',
          pointsCost: 3000,
          category: 'testing',
          availability: 'available',
        },
        {
          id: 'amazon_gift_card',
          name: '아마존 기프트카드',
          description: '50,000원 상당의 아마존 기프트카드',
          pointsCost: 1500,
          category: 'gift_card',
          availability: 'available',
        },
        {
          id: 'research_report',
          name: '개인 건강 리포트',
          description: '참여한 연구 기반 개인 맞춤 건강 분석 리포트',
          pointsCost: 500,
          category: 'report',
          availability: 'available',
        },
      ];

      res.json({
        message: '인센티브 사용 가능 항목을 조회했습니다.',
        items: redeemableItems,
      });
    } catch (error) {
      console.error('Error fetching redeemable items:', error);
      res.status(500).json({
        error: '사용 가능 항목 조회 중 오류가 발생했습니다.',
      });
    }
  }

  /**
   * 연구 참여 동의서 생성
   */
  static async generateConsentForm(req: AuthenticatedRequest, res: Response) {
    try {
      const { researchProjectId } = req.params;
      const userId = req.user!.id;

      // 연구 프로젝트 정보 조회 (실제로는 외부 API에서)
      const consentForm = {
        researchProjectId,
        title: '연구 참여 동의서',
        researchTitle: '심혈관 질환 예측 AI 모델 개발',
        institution: '서울대학교 의과대학',
        principalInvestigator: '김○○ 교수',
        purpose: '웨어러블 기기 데이터를 활용하여 심혈관 질환을 조기에 예측할 수 있는 AI 모델을 개발하는 것입니다.',
        procedures: [
          '개인 건강 데이터 (바이탈 사인, 운동 기록 등) 제공',
          '웨어러블 기기 착용 및 데이터 수집',
          '월 1회 온라인 설문 참여',
          '필요시 추가 건강검진 참여',
        ],
        risks: [
          '개인정보 노출 위험 (최소화를 위해 익명화 처리)',
          '데이터 오남용 가능성 (엄격한 보안 정책 적용)',
        ],
        benefits: [
          '개인 맞춤형 건강 분석 리포트 제공',
          '연구 참여 인센티브 포인트 지급',
          '의학 발전에 기여',
        ],
        dataUsage: {
          types: ['바이탈 사인', '운동 기록', '수면 패턴', '심박수 변이성'],
          anonymization: '개인 식별 정보는 완전히 제거되며, 연구 목적으로만 사용됩니다.',
          retention: '연구 완료 후 5년간 보관 후 완전 삭제',
          sharing: '연구 컨소시엄 내에서만 공유되며, 상업적 목적으로 사용되지 않습니다.',
        },
        rights: [
          '언제든지 연구 참여를 철회할 수 있습니다.',
          '개인 데이터의 삭제를 요청할 수 있습니다.',
          '연구 결과에 대한 정보를 제공받을 수 있습니다.',
          '데이터 사용 현황을 확인할 수 있습니다.',
        ],
        contact: {
          researcher: '김○○ 교수 (kim@snu.ac.kr, 02-1234-5678)',
          irb: '서울대학교 IRB (irb@snu.ac.kr, 02-1234-5679)',
        },
        version: '1.0',
        effectiveDate: '2024-01-01',
      };

      res.json({
        message: '연구 참여 동의서를 생성했습니다.',
        consentForm,
      });
    } catch (error) {
      console.error('Error generating consent form:', error);
      res.status(500).json({
        error: '동의서 생성 중 오류가 발생했습니다.',
      });
    }
  }
}