import prisma from '../config/database';

export interface ResearchParticipation {
  id: string;
  userId: string;
  studyId: string;
  studyTitle: string;
  studyType: string;
  participationDate: Date;
  status: 'pending' | 'active' | 'completed' | 'withdrawn';
  consentGiven: boolean;
  dataShared?: any;
  incentivesEarned: number;
  completionDate?: Date;
  withdrawalReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  institution: string;
  principalInvestigator: string;
  participationType: 'data_sharing' | 'clinical_trial' | 'survey';
  eligibilityCriteria: any;
  expectedDuration: number; // 일 단위
  incentivePoints: number;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'recruiting' | 'active' | 'completed' | 'suspended';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface UserIncentive {
  id: string;
  userId: string;
  incentiveType: string;
  pointsEarned: number;
  pointsRedeemed: number;
  description: string;
  earnedDate: Date;
  redeemedDate?: Date;
  expiresAt?: Date;
  status: string;
  metadata?: any;
  createdAt: Date;
}

export class ResearchParticipationModel {
  /**
   * 연구 프로젝트 매칭 알고리즘 (요구사항 16.2)
   */
  static async matchResearchProjects(userId: string): Promise<ResearchProject[]> {
    // 사용자 프로필 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        healthRecords: true,
        medicalRecords: true,
        genomicData: true,
        familyHistory: true,
      },
    });

    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 모든 활성 연구 프로젝트 조회
    const allProjects = await this.getActiveResearchProjects();

    // 사용자 특성 분석
    const userProfile = this.analyzeUserProfile(user);

    // 매칭 점수 계산 및 정렬
    const matchedProjects = allProjects
      .map(project => ({
        ...project,
        matchScore: this.calculateMatchScore(userProfile, project),
      }))
      .filter(project => project.matchScore > 0.3) // 30% 이상 매칭되는 프로젝트만
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // 상위 10개 프로젝트

    return matchedProjects;
  }

  /**
   * 활성 연구 프로젝트 조회
   */
  private static async getActiveResearchProjects(): Promise<ResearchProject[]> {
    // 실제 구현에서는 외부 연구 데이터베이스나 API에서 조회
    // 여기서는 예시 데이터 반환
    return [
      {
        id: 'research_001',
        title: '심혈관 질환 예측 AI 모델 개발',
        description: '웨어러블 기기 데이터를 활용한 심혈관 질환 조기 예측 모델 개발 연구',
        institution: '서울대학교 의과대학',
        principalInvestigator: '김○○ 교수',
        participationType: 'data_sharing',
        eligibilityCriteria: {
          ageRange: { min: 30, max: 70 },
          conditions: ['hypertension', 'diabetes'],
          dataTypes: ['vital_signs', 'wearable_data'],
        },
        expectedDuration: 365,
        incentivePoints: 1000,
        maxParticipants: 500,
        currentParticipants: 234,
        status: 'recruiting',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date('2023-12-01'),
      },
      {
        id: 'research_002',
        title: '유전체 기반 개인화 영양 권장 시스템',
        description: '유전체 정보와 생활습관 데이터를 활용한 개인화 영양 권장 시스템 개발',
        institution: '연세대학교 의과대학',
        principalInvestigator: '이○○ 교수',
        participationType: 'data_sharing',
        eligibilityCriteria: {
          ageRange: { min: 20, max: 65 },
          dataTypes: ['genomic_data', 'health_records', 'lifestyle_habits'],
        },
        expectedDuration: 180,
        incentivePoints: 800,
        maxParticipants: 300,
        currentParticipants: 156,
        status: 'recruiting',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-01'),
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'research_003',
        title: '정신건강 모니터링 앱 효과성 연구',
        description: '디지털 치료제로서의 정신건강 모니터링 앱의 임상적 효과성 검증',
        institution: '고려대학교 의과대학',
        principalInvestigator: '박○○ 교수',
        participationType: 'clinical_trial',
        eligibilityCriteria: {
          ageRange: { min: 18, max: 50 },
          conditions: ['depression', 'anxiety'],
          exclusions: ['severe_mental_illness'],
        },
        expectedDuration: 90,
        incentivePoints: 1500,
        maxParticipants: 100,
        currentParticipants: 67,
        status: 'recruiting',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-06-01'),
        createdAt: new Date('2024-02-01'),
      },
    ] as ResearchProject[];
  }

  /**
   * 사용자 프로필 분석
   */
  private static analyzeUserProfile(user: any): any {
    const age = user.birthDate ? 
      Math.floor((Date.now() - new Date(user.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
      null;

    return {
      age,
      gender: user.gender,
      hasVitalSigns: user.healthRecords?.some((record: any) => record.recordType === 'vital_signs') || false,
      hasMedicalHistory: user.medicalRecords?.length > 0 || false,
      hasGenomicData: user.genomicData?.length > 0 || false,
      hasFamilyHistory: user.familyHistory?.length > 0 || false,
      lifestyleHabits: user.lifestyleHabits,
      medicalConditions: this.extractMedicalConditions(user.medicalRecords || []),
    };
  }

  /**
   * 의료 상태 추출
   */
  private static extractMedicalConditions(medicalRecords: any[]): string[] {
    const conditions: string[] = [];
    
    medicalRecords.forEach(record => {
      if (record.diagnosisCode) {
        // ICD-10 코드를 기반으로 주요 질환 분류
        if (record.diagnosisCode.startsWith('I')) {
          conditions.push('cardiovascular');
        }
        if (record.diagnosisCode.startsWith('E10') || record.diagnosisCode.startsWith('E11')) {
          conditions.push('diabetes');
        }
        if (record.diagnosisCode.startsWith('I10')) {
          conditions.push('hypertension');
        }
        if (record.diagnosisCode.startsWith('F')) {
          conditions.push('mental_health');
        }
      }
    });

    return [...new Set(conditions)]; // 중복 제거
  }

  /**
   * 매칭 점수 계산
   */
  private static calculateMatchScore(userProfile: any, project: ResearchProject): number {
    let score = 0;
    let maxScore = 0;

    // 나이 매칭 (가중치: 30%)
    maxScore += 30;
    if (userProfile.age && project.eligibilityCriteria.ageRange) {
      const { min, max } = project.eligibilityCriteria.ageRange;
      if (userProfile.age >= min && userProfile.age <= max) {
        score += 30;
      } else {
        // 나이가 범위를 벗어나면 매칭 불가
        return 0;
      }
    }

    // 데이터 타입 매칭 (가중치: 40%)
    maxScore += 40;
    if (project.eligibilityCriteria.dataTypes) {
      const requiredDataTypes = project.eligibilityCriteria.dataTypes;
      let availableDataTypes = 0;

      requiredDataTypes.forEach((dataType: string) => {
        switch (dataType) {
          case 'vital_signs':
            if (userProfile.hasVitalSigns) availableDataTypes++;
            break;
          case 'genomic_data':
            if (userProfile.hasGenomicData) availableDataTypes++;
            break;
          case 'health_records':
            if (userProfile.hasVitalSigns) availableDataTypes++;
            break;
          case 'medical_records':
            if (userProfile.hasMedicalHistory) availableDataTypes++;
            break;
          case 'family_history':
            if (userProfile.hasFamilyHistory) availableDataTypes++;
            break;
        }
      });

      score += (availableDataTypes / requiredDataTypes.length) * 40;
    }

    // 의료 상태 매칭 (가중치: 20%)
    maxScore += 20;
    if (project.eligibilityCriteria.conditions) {
      const requiredConditions = project.eligibilityCriteria.conditions;
      const matchingConditions = requiredConditions.filter((condition: string) =>
        userProfile.medicalConditions.includes(condition)
      );
      
      if (matchingConditions.length > 0) {
        score += (matchingConditions.length / requiredConditions.length) * 20;
      }
    } else {
      score += 20; // 특정 조건이 없으면 만점
    }

    // 제외 조건 확인 (가중치: 10%)
    maxScore += 10;
    if (project.eligibilityCriteria.exclusions) {
      const hasExclusions = project.eligibilityCriteria.exclusions.some((exclusion: string) =>
        userProfile.medicalConditions.includes(exclusion)
      );
      
      if (!hasExclusions) {
        score += 10;
      } else {
        return 0; // 제외 조건에 해당하면 매칭 불가
      }
    } else {
      score += 10;
    }

    return score / maxScore; // 0-1 사이의 점수로 정규화
  }

  /**
   * 연구 참여 신청 (요구사항 16.3)
   */
  static async applyForResearch(
    userId: string,
    researchProjectId: string,
    consentGiven: boolean
  ): Promise<ResearchParticipation> {
    // 이미 참여 중인지 확인
    const existingParticipation = await prisma.researchParticipation.findFirst({
      where: {
        userId,
        researchProjectId,
        status: { in: ['pending', 'active'] },
      },
    });

    if (existingParticipation) {
      throw new Error('이미 해당 연구에 참여 중입니다.');
    }

    // 연구 프로젝트 정보 조회
    const projects = await this.getActiveResearchProjects();
    const project = projects.find(p => p.id === researchProjectId);

    if (!project) {
      throw new Error('연구 프로젝트를 찾을 수 없습니다.');
    }

    if (project.status !== 'recruiting') {
      throw new Error('현재 모집 중이지 않은 연구입니다.');
    }

    // 참여 신청 생성
    const participation = await prisma.researchParticipation.create({
      data: {
        userId,
        studyId: researchProjectId,
        studyTitle: project.title,
        studyType: project.participationType,
        participationDate: new Date(),
        consentGiven,
        status: consentGiven ? 'pending' : 'pending',
        incentivesEarned: 0,
      },
    });

    return participation as ResearchParticipation;
  }

  /**
   * 연구 참여 승인/거부 (연구진용)
   */
  static async updateParticipationStatus(
    participationId: string,
    status: 'active' | 'completed' | 'withdrawn',
    startDate?: Date,
    endDate?: Date
  ): Promise<ResearchParticipation> {
    const participation = await prisma.researchParticipation.update({
      where: { id: participationId },
      data: {
        status,
        ...(startDate && { participationStartDate: startDate }),
        ...(endDate && { participationEndDate: endDate }),
      },
    });

    // 참여 시작 시 초기 인센티브 지급
    if (status === 'active' && startDate) {
      await this.awardIncentivePoints(
        participation.userId,
        'research_participation_start',
        100,
        `연구 참여 시작: ${participation.researchTitle}`,
        participationId
      );
    }

    return participation as ResearchParticipation;
  }

  /**
   * 사용자의 연구 참여 현황 조회 (요구사항 16.5)
   */
  static async getUserParticipations(
    userId: string,
    status?: string
  ): Promise<ResearchParticipation[]> {
    const participations = await prisma.researchParticipation.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return participations as ResearchParticipation[];
  }

  /**
   * 연구 결과 피드백 제공 (요구사항 16.5)
   */
  static async getResearchFeedback(
    userId: string,
    participationId: string
  ): Promise<{
    participation: ResearchParticipation;
    feedback: any;
    results: any;
  }> {
    const participation = await prisma.researchParticipation.findFirst({
      where: {
        id: participationId,
        userId,
      },
    });

    if (!participation) {
      throw new Error('연구 참여 기록을 찾을 수 없습니다.');
    }

    // 연구 결과 및 피드백 (실제로는 연구진이 제공)
    const feedback = {
      participationSummary: {
        duration: participation.participationStartDate && participation.participationEndDate
          ? Math.ceil((new Date(participation.participationEndDate).getTime() - new Date(participation.participationStartDate).getTime()) / (1000 * 60 * 60 * 24))
          : null,
        dataContributed: this.calculateDataContribution(userId, participation),
        completionRate: 95.5,
      },
      researchProgress: {
        status: 'ongoing',
        expectedCompletion: '2024-12-31',
        preliminaryFindings: '참여자들의 데이터를 통해 유의미한 패턴을 발견했습니다.',
      },
      personalInsights: {
        dataQuality: 'excellent',
        uniqueContributions: [
          '희귀한 유전적 변이 데이터 제공',
          '장기간 일관된 바이탈 사인 데이터',
        ],
        recommendations: [
          '지속적인 건강 모니터링 권장',
          '정기적인 건강검진 필요',
        ],
      },
      incentivesEarned: {
        totalPoints: participation.incentivesEarned,
        breakdown: [
          { type: '참여 시작', points: 100, date: participation.participationDate },
          { type: '데이터 기여', points: participation.incentivesEarned - 100, date: new Date() },
        ],
      },
    };

    const results = {
      publicationStatus: 'in_preparation',
      expectedPublications: [
        {
          title: 'AI-based Cardiovascular Risk Prediction Using Wearable Data',
          journal: 'Nature Digital Medicine',
          expectedDate: '2025-03-01',
        },
      ],
      dataUsage: {
        anonymizationLevel: 'high',
        sharingScope: 'research_consortium',
        retentionPeriod: '5_years',
      },
    };

    return {
      participation: participation as ResearchParticipation,
      feedback,
      results,
    };
  }

  /**
   * 데이터 기여도 계산
   */
  private static calculateDataContribution(userId: string, participation: ResearchParticipation): any {
    // 실제 구현에서는 사용자가 제공한 데이터의 양과 질을 계산
    return {
      vitalSigns: { records: 1250, quality: 'high' },
      healthRecords: { records: 45, quality: 'medium' },
      genomicData: { snps: 650000, quality: 'excellent' },
      totalScore: 92.5,
    };
  }

  /**
   * 인센티브 포인트 지급 (요구사항 16.4)
   */
  static async awardIncentivePoints(
    userId: string,
    incentiveType: string,
    points: number,
    description: string,
    referenceId?: string
  ): Promise<UserIncentive> {
    const incentive = await prisma.userIncentive.create({
      data: {
        userId,
        incentiveType,
        pointsEarned: points,
        pointsRedeemed: 0,
        description,
        earnedDate: new Date(),
        status: 'active',
      },
    });

    return incentive as UserIncentive;
  }

  /**
   * 사용자 인센티브 현황 조회 (요구사항 16.4)
   */
  static async getUserIncentives(userId: string): Promise<{
    totalPoints: number;
    availablePoints: number;
    redeemedPoints: number;
    incentives: UserIncentive[];
  }> {
    const incentives = await prisma.userIncentive.findMany({
      where: { userId },
      orderBy: { earnedDate: 'desc' },
    });

    const totalPoints = incentives.reduce((sum, incentive) => sum + incentive.pointsEarned, 0);
    const redeemedPoints = incentives.reduce((sum, incentive) => sum + incentive.pointsRedeemed, 0);
    const availablePoints = totalPoints - redeemedPoints;

    return {
      totalPoints,
      availablePoints,
      redeemedPoints,
      incentives: incentives as UserIncentive[],
    };
  }

  /**
   * 인센티브 포인트 사용
   */
  static async redeemIncentivePoints(
    userId: string,
    points: number,
    redeemType: string,
    description: string
  ): Promise<{
    success: boolean;
    remainingPoints: number;
    transaction: any;
  }> {
    const incentiveStatus = await this.getUserIncentives(userId);

    if (incentiveStatus.availablePoints < points) {
      throw new Error('사용 가능한 포인트가 부족합니다.');
    }

    // 포인트 사용 기록 생성
    const transaction = await prisma.userIncentive.create({
      data: {
        userId,
        incentiveType: redeemType,
        pointsEarned: 0,
        pointsRedeemed: points,
        description,
        earnedDate: new Date(),
        redeemedDate: new Date(),
        status: 'redeemed',
      },
    });

    return {
      success: true,
      remainingPoints: incentiveStatus.availablePoints - points,
      transaction,
    };
  }

  /**
   * 연구 참여 통계
   */
  static async getResearchStats(): Promise<{
    totalParticipations: number;
    activeParticipations: number;
    completedParticipations: number;
    totalIncentivesAwarded: number;
    participationByType: Record<string, number>;
    monthlyParticipations: Array<{ month: string; count: number }>;
  }> {
    const [
      totalParticipations,
      activeParticipations,
      completedParticipations,
      allParticipations,
      allIncentives,
    ] = await Promise.all([
      prisma.researchParticipation.count(),
      prisma.researchParticipation.count({ where: { status: 'active' } }),
      prisma.researchParticipation.count({ where: { status: 'completed' } }),
      prisma.researchParticipation.findMany({
        select: { studyType: true, createdAt: true },
      }),
      prisma.userIncentive.findMany({
        select: { pointsEarned: true },
      }),
    ]);

    // 참여 타입별 통계
    const participationByType = allParticipations.reduce((acc, participation) => {
      acc[participation.studyType] = (acc[participation.studyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 월별 참여 통계 (최근 12개월)
    const monthlyParticipations = this.calculateMonthlyStats(allParticipations);

    // 총 지급된 인센티브
    const totalIncentivesAwarded = allIncentives.reduce(
      (sum, incentive) => sum + incentive.pointsEarned,
      0
    );

    return {
      totalParticipations,
      activeParticipations,
      completedParticipations,
      totalIncentivesAwarded,
      participationByType,
      monthlyParticipations,
    };
  }

  /**
   * 월별 통계 계산
   */
  private static calculateMonthlyStats(participations: any[]): Array<{ month: string; count: number }> {
    const monthlyStats: Record<string, number> = {};
    
    participations.forEach(participation => {
      const month = new Date(participation.createdAt).toISOString().substring(0, 7); // YYYY-MM
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    // 최근 12개월 데이터 생성
    const result = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toISOString().substring(0, 7);
      result.push({
        month,
        count: monthlyStats[month] || 0,
      });
    }

    return result;
  }
}