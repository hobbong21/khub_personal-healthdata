import prisma from '../config/database';

export interface IncentiveRule {
  id: string;
  name: string;
  description: string;
  incentiveType: string;
  triggerCondition: any;
  pointsAwarded: number;
  maxPointsPerDay?: number;
  maxPointsPerMonth?: number;
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date;
  createdAt: Date;
}

export interface DataContribution {
  userId: string;
  dataType: string;
  recordCount: number;
  qualityScore: number;
  contributionDate: Date;
  pointsEarned: number;
}

export interface IncentiveTransaction {
  id: string;
  userId: string;
  transactionType: 'earn' | 'redeem' | 'expire' | 'bonus';
  points: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: any;
  createdAt: Date;
}

export class IncentiveManagementModel {
  /**
   * 데이터 기여도 계산 로직 (요구사항 16.4)
   */
  static async calculateDataContribution(
    userId: string,
    dataType: string,
    timeRange: { start: Date; end: Date }
  ): Promise<DataContribution> {
    let recordCount = 0;
    let qualityScore = 0;

    // 데이터 타입별 기여도 계산
    switch (dataType) {
      case 'vital_signs':
        const vitalSigns = await prisma.vitalSign.findMany({
          where: {
            userId,
            measuredAt: {
              gte: timeRange.start,
              lte: timeRange.end,
            },
          },
        });
        recordCount = vitalSigns.length;
        qualityScore = this.calculateVitalSignsQuality(vitalSigns);
        break;

      case 'health_records':
        const healthRecords = await prisma.healthRecord.findMany({
          where: {
            userId,
            recordedDate: {
              gte: timeRange.start,
              lte: timeRange.end,
            },
          },
        });
        recordCount = healthRecords.length;
        qualityScore = this.calculateHealthRecordsQuality(healthRecords);
        break;

      case 'medical_records':
        const medicalRecords = await prisma.medicalRecord.findMany({
          where: {
            userId,
            visitDate: {
              gte: timeRange.start,
              lte: timeRange.end,
            },
          },
        });
        recordCount = medicalRecords.length;
        qualityScore = this.calculateMedicalRecordsQuality(medicalRecords);
        break;

      case 'genomic_data':
        const genomicData = await prisma.genomicData.findMany({
          where: {
            userId,
            uploadedAt: {
              gte: timeRange.start,
              lte: timeRange.end,
            },
          },
        });
        recordCount = genomicData.length;
        qualityScore = this.calculateGenomicDataQuality(genomicData);
        break;

      case 'wearable_data':
        const wearableData = await prisma.wearableDataPoint.findMany({
          where: {
            userId,
            recordedAt: {
              gte: timeRange.start,
              lte: timeRange.end,
            },
          },
        });
        recordCount = wearableData.length;
        qualityScore = this.calculateWearableDataQuality(wearableData);
        break;

      default:
        recordCount = 0;
        qualityScore = 0;
    }

    // 기여도 기반 포인트 계산
    const pointsEarned = this.calculateContributionPoints(dataType, recordCount, qualityScore);

    return {
      userId,
      dataType,
      recordCount,
      qualityScore,
      contributionDate: new Date(),
      pointsEarned,
    };
  }

  /**
   * 바이탈 사인 데이터 품질 계산
   */
  private static calculateVitalSignsQuality(vitalSigns: any[]): number {
    if (vitalSigns.length === 0) return 0;

    let qualityScore = 0;
    let totalChecks = 0;

    vitalSigns.forEach(vs => {
      totalChecks += 4; // 4가지 품질 기준

      // 1. 데이터 완성도
      if (vs.value !== null && vs.value !== undefined) {
        qualityScore += 25;
      }

      // 2. 측정 시간 일관성 (정기적인 측정)
      const hour = new Date(vs.measuredAt).getHours();
      if (hour >= 6 && hour <= 22) { // 일반적인 활동 시간
        qualityScore += 25;
      }

      // 3. 값의 합리성
      if (this.isReasonableVitalSign(vs.type, vs.value)) {
        qualityScore += 25;
      }

      // 4. 단위 정보 존재
      if (vs.unit) {
        qualityScore += 25;
      }
    });

    return totalChecks > 0 ? qualityScore / totalChecks : 0;
  }

  /**
   * 건강 기록 데이터 품질 계산
   */
  private static calculateHealthRecordsQuality(healthRecords: any[]): number {
    if (healthRecords.length === 0) return 0;

    let qualityScore = 0;
    let totalChecks = 0;

    healthRecords.forEach(record => {
      totalChecks += 3;

      // 1. 데이터 완성도
      if (record.data && Object.keys(record.data).length > 0) {
        qualityScore += 40;
      }

      // 2. 기록 타입 명시
      if (record.recordType) {
        qualityScore += 30;
      }

      // 3. 기록 날짜 정확성
      if (record.recordedDate && new Date(record.recordedDate) <= new Date()) {
        qualityScore += 30;
      }
    });

    return totalChecks > 0 ? qualityScore / totalChecks : 0;
  }

  /**
   * 진료 기록 데이터 품질 계산
   */
  private static calculateMedicalRecordsQuality(medicalRecords: any[]): number {
    if (medicalRecords.length === 0) return 0;

    let qualityScore = 0;
    let totalChecks = 0;

    medicalRecords.forEach(record => {
      totalChecks += 5;

      // 1. 병원명 존재
      if (record.hospitalName) qualityScore += 20;

      // 2. 진단 코드 존재
      if (record.diagnosisCode) qualityScore += 20;

      // 3. 진단 설명 존재
      if (record.diagnosisDescription) qualityScore += 20;

      // 4. 의사 소견 존재
      if (record.doctorNotes) qualityScore += 20;

      // 5. 방문 날짜 정확성
      if (record.visitDate && new Date(record.visitDate) <= new Date()) {
        qualityScore += 20;
      }
    });

    return totalChecks > 0 ? qualityScore / totalChecks : 0;
  }

  /**
   * 유전체 데이터 품질 계산
   */
  private static calculateGenomicDataQuality(genomicData: any[]): number {
    if (genomicData.length === 0) return 0;

    let qualityScore = 0;
    let totalChecks = 0;

    genomicData.forEach(data => {
      totalChecks += 3;

      // 1. SNP 데이터 존재 및 크기
      if (data.snpData && Object.keys(data.snpData).length > 100000) {
        qualityScore += 40;
      } else if (data.snpData && Object.keys(data.snpData).length > 10000) {
        qualityScore += 20;
      }

      // 2. 분석 결과 존재
      if (data.analysisResults && Object.keys(data.analysisResults).length > 0) {
        qualityScore += 30;
      }

      // 3. 플랫폼 정보 존재
      if (data.sourcePlatform) {
        qualityScore += 30;
      }
    });

    return totalChecks > 0 ? qualityScore / totalChecks : 0;
  }

  /**
   * 웨어러블 데이터 품질 계산
   */
  private static calculateWearableDataQuality(wearableData: any[]): number {
    if (wearableData.length === 0) return 0;

    let qualityScore = 0;
    let totalChecks = 0;

    // 데이터 연속성 확인
    const dataByType = wearableData.reduce((acc, data) => {
      if (!acc[data.dataType]) acc[data.dataType] = [];
      acc[data.dataType].push(data);
      return acc;
    }, {});

    Object.keys(dataByType).forEach(dataType => {
      const typeData = dataByType[dataType];
      totalChecks += 2;

      // 1. 데이터 연속성 (일정한 간격으로 수집)
      if (typeData.length > 1) {
        const intervals = [];
        for (let i = 1; i < typeData.length; i++) {
          const interval = new Date(typeData[i].recordedAt).getTime() - new Date(typeData[i-1].recordedAt).getTime();
          intervals.push(interval);
        }
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const consistency = intervals.filter(interval => Math.abs(interval - avgInterval) < avgInterval * 0.5).length / intervals.length;
        qualityScore += consistency * 50;
      }

      // 2. 데이터 값의 합리성
      const reasonableValues = typeData.filter(data => this.isReasonableWearableValue(dataType, data.value)).length;
      qualityScore += (reasonableValues / typeData.length) * 50;
    });

    return totalChecks > 0 ? qualityScore / totalChecks : 0;
  }

  /**
   * 바이탈 사인 값의 합리성 검사
   */
  private static isReasonableVitalSign(type: string, value: any): boolean {
    switch (type) {
      case 'heart_rate':
        return typeof value === 'number' && value >= 30 && value <= 220;
      case 'blood_pressure':
        return value && value.systolic >= 70 && value.systolic <= 250 && 
               value.diastolic >= 40 && value.diastolic <= 150;
      case 'temperature':
        return typeof value === 'number' && value >= 35.0 && value <= 42.0;
      case 'oxygen_saturation':
        return typeof value === 'number' && value >= 70 && value <= 100;
      default:
        return true;
    }
  }

  /**
   * 웨어러블 데이터 값의 합리성 검사
   */
  private static isReasonableWearableValue(dataType: string, value: any): boolean {
    switch (dataType) {
      case 'steps':
        return typeof value === 'number' && value >= 0 && value <= 50000;
      case 'calories':
        return typeof value === 'number' && value >= 0 && value <= 10000;
      case 'distance':
        return typeof value === 'number' && value >= 0 && value <= 100; // km
      case 'sleep_duration':
        return typeof value === 'number' && value >= 0 && value <= 24; // hours
      default:
        return true;
    }
  }

  /**
   * 기여도 기반 포인트 계산
   */
  private static calculateContributionPoints(
    dataType: string,
    recordCount: number,
    qualityScore: number
  ): number {
    // 데이터 타입별 기본 포인트
    const basePoints = {
      vital_signs: 2,
      health_records: 5,
      medical_records: 10,
      genomic_data: 50,
      wearable_data: 1,
    };

    const base = basePoints[dataType as keyof typeof basePoints] || 1;
    
    // 기본 포인트 × 레코드 수 × 품질 점수 (0-1) × 보너스 배수
    let points = base * recordCount * (qualityScore / 100);

    // 품질 보너스
    if (qualityScore >= 90) {
      points *= 1.5; // 50% 보너스
    } else if (qualityScore >= 80) {
      points *= 1.2; // 20% 보너스
    }

    // 대량 데이터 보너스
    if (recordCount >= 100) {
      points *= 1.3;
    } else if (recordCount >= 50) {
      points *= 1.1;
    }

    return Math.round(points);
  }

  /**
   * 포인트 및 리워드 시스템 (요구사항 16.4)
   */
  static async processIncentiveRules(userId: string): Promise<IncentiveTransaction[]> {
    const transactions: IncentiveTransaction[] = [];
    
    // 활성 인센티브 규칙 조회
    const activeRules = await this.getActiveIncentiveRules();

    for (const rule of activeRules) {
      const earnedPoints = await this.evaluateIncentiveRule(userId, rule);
      
      if (earnedPoints > 0) {
        // 일일/월간 한도 확인
        const canAward = await this.checkIncentiveLimits(userId, rule, earnedPoints);
        
        if (canAward) {
          const transaction = await this.createIncentiveTransaction({
            userId,
            transactionType: 'earn',
            points: earnedPoints,
            description: `${rule.name}: ${rule.description}`,
            referenceType: 'incentive_rule',
            referenceId: rule.id,
            metadata: { ruleId: rule.id, ruleName: rule.name },
          });
          
          transactions.push(transaction);
        }
      }
    }

    return transactions;
  }

  /**
   * 활성 인센티브 규칙 조회
   */
  private static async getActiveIncentiveRules(): Promise<IncentiveRule[]> {
    const now = new Date();
    
    // 실제 구현에서는 데이터베이스에서 조회
    return [
      {
        id: 'daily_vitals',
        name: '일일 바이탈 사인 기록',
        description: '하루에 3회 이상 바이탈 사인 기록 시 보너스',
        incentiveType: 'daily_activity',
        triggerCondition: {
          dataType: 'vital_signs',
          minRecords: 3,
          timeWindow: 'daily',
        },
        pointsAwarded: 50,
        maxPointsPerDay: 50,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'weekly_exercise',
        name: '주간 운동 목표 달성',
        description: '주 5회 이상 운동 기록 시 보너스',
        incentiveType: 'weekly_goal',
        triggerCondition: {
          dataType: 'exercise_log',
          minRecords: 5,
          timeWindow: 'weekly',
        },
        pointsAwarded: 200,
        maxPointsPerMonth: 800,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'data_quality_bonus',
        name: '고품질 데이터 기여',
        description: '데이터 품질 점수 90점 이상 달성 시 보너스',
        incentiveType: 'quality_bonus',
        triggerCondition: {
          qualityThreshold: 90,
          timeWindow: 'monthly',
        },
        pointsAwarded: 500,
        maxPointsPerMonth: 1500,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'research_participation',
        name: '연구 참여 완료',
        description: '연구 프로젝트 참여 완료 시 보너스',
        incentiveType: 'milestone',
        triggerCondition: {
          eventType: 'research_completed',
        },
        pointsAwarded: 1000,
        isActive: true,
        validFrom: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
      },
    ] as IncentiveRule[];
  }

  /**
   * 인센티브 규칙 평가
   */
  private static async evaluateIncentiveRule(userId: string, rule: IncentiveRule): Promise<number> {
    const condition = rule.triggerCondition;
    
    switch (rule.incentiveType) {
      case 'daily_activity':
        return await this.evaluateDailyActivity(userId, condition);
      case 'weekly_goal':
        return await this.evaluateWeeklyGoal(userId, condition);
      case 'quality_bonus':
        return await this.evaluateQualityBonus(userId, condition);
      case 'milestone':
        return await this.evaluateMilestone(userId, condition);
      default:
        return 0;
    }
  }

  /**
   * 일일 활동 평가
   */
  private static async evaluateDailyActivity(userId: string, condition: any): Promise<number> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    if (condition.dataType === 'vital_signs') {
      const count = await prisma.vitalSign.count({
        where: {
          userId,
          measuredAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      return count >= condition.minRecords ? 1 : 0;
    }

    return 0;
  }

  /**
   * 주간 목표 평가
   */
  private static async evaluateWeeklyGoal(userId: string, condition: any): Promise<number> {
    const today = new Date();
    const startOfWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const endOfWeek = new Date(startOfWeek.getTime() + (7 * 24 * 60 * 60 * 1000));

    // 운동 기록 확인 (실제로는 exercise_log 테이블에서 조회)
    const exerciseCount = await prisma.healthRecord.count({
      where: {
        userId,
        recordType: 'exercise',
        recordedDate: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
    });

    return exerciseCount >= condition.minRecords ? 1 : 0;
  }

  /**
   * 품질 보너스 평가
   */
  private static async evaluateQualityBonus(userId: string, condition: any): Promise<number> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // 월간 데이터 품질 계산
    const monthlyContribution = await this.calculateDataContribution(
      userId,
      'vital_signs',
      { start: startOfMonth, end: endOfMonth }
    );

    return monthlyContribution.qualityScore >= condition.qualityThreshold ? 1 : 0;
  }

  /**
   * 마일스톤 평가
   */
  private static async evaluateMilestone(userId: string, condition: any): Promise<number> {
    if (condition.eventType === 'research_completed') {
      // 최근 완료된 연구 참여 확인
      const recentCompletion = await prisma.researchParticipation.findFirst({
        where: {
          userId,
          status: 'completed',
          participationEndDate: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 최근 24시간
          },
        },
      });

      return recentCompletion ? 1 : 0;
    }

    return 0;
  }

  /**
   * 인센티브 한도 확인
   */
  private static async checkIncentiveLimits(
    userId: string,
    rule: IncentiveRule,
    points: number
  ): Promise<boolean> {
    const today = new Date();

    // 일일 한도 확인
    if (rule.maxPointsPerDay) {
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dailyPoints = await this.getTotalPointsInPeriod(userId, rule.id, startOfDay, today);
      
      if (dailyPoints + points > rule.maxPointsPerDay) {
        return false;
      }
    }

    // 월간 한도 확인
    if (rule.maxPointsPerMonth) {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthlyPoints = await this.getTotalPointsInPeriod(userId, rule.id, startOfMonth, today);
      
      if (monthlyPoints + points > rule.maxPointsPerMonth) {
        return false;
      }
    }

    return true;
  }

  /**
   * 기간별 총 포인트 조회
   */
  private static async getTotalPointsInPeriod(
    userId: string,
    ruleId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const transactions = await prisma.userIncentive.findMany({
      where: {
        userId,
        earnedAt: {
          gte: startDate,
          lte: endDate,
        },
        // referenceId가 ruleId와 일치하는 경우만 (실제 구현에서는 별도 필드 필요)
      },
    });

    return transactions.reduce((sum, transaction) => sum + transaction.pointsEarned, 0);
  }

  /**
   * 인센티브 트랜잭션 생성
   */
  private static async createIncentiveTransaction(data: {
    userId: string;
    transactionType: 'earn' | 'redeem' | 'expire' | 'bonus';
    points: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
    metadata?: any;
  }): Promise<IncentiveTransaction> {
    const transaction = await prisma.userIncentive.create({
      data: {
        userId: data.userId,
        incentiveType: data.referenceType || 'general',
        pointsEarned: data.transactionType === 'earn' || data.transactionType === 'bonus' ? data.points : 0,
        pointsRedeemed: data.transactionType === 'redeem' ? data.points : 0,
        description: data.description,
        referenceId: data.referenceId,
      },
    });

    return {
      id: transaction.id,
      userId: transaction.userId,
      transactionType: data.transactionType,
      points: data.points,
      description: transaction.description,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      metadata: data.metadata,
      createdAt: transaction.earnedAt,
    };
  }

  /**
   * 인센티브 지급 관리 (요구사항 16.4)
   */
  static async processIncentivePayments(): Promise<{
    processedUsers: number;
    totalPointsAwarded: number;
    transactions: IncentiveTransaction[];
  }> {
    const allUsers = await prisma.user.findMany({
      select: { id: true },
    });

    let totalPointsAwarded = 0;
    const allTransactions: IncentiveTransaction[] = [];

    for (const user of allUsers) {
      try {
        const userTransactions = await this.processIncentiveRules(user.id);
        allTransactions.push(...userTransactions);
        
        const userPoints = userTransactions.reduce((sum, t) => sum + t.points, 0);
        totalPointsAwarded += userPoints;
      } catch (error) {
        console.error(`Error processing incentives for user ${user.id}:`, error);
      }
    }

    return {
      processedUsers: allUsers.length,
      totalPointsAwarded,
      transactions: allTransactions,
    };
  }

  /**
   * 사용자별 인센티브 대시보드 데이터
   */
  static async getUserIncentiveDashboard(userId: string): Promise<{
    currentBalance: number;
    totalEarned: number;
    totalRedeemed: number;
    recentTransactions: IncentiveTransaction[];
    availableRewards: any[];
    achievements: any[];
    nextMilestones: any[];
  }> {
    // 인센티브 현황 조회
    const incentives = await prisma.userIncentive.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    const totalEarned = incentives.reduce((sum, i) => sum + i.pointsEarned, 0);
    const totalRedeemed = incentives.reduce((sum, i) => sum + i.pointsRedeemed, 0);
    const currentBalance = totalEarned - totalRedeemed;

    // 최근 트랜잭션 (최근 10개)
    const recentTransactions: IncentiveTransaction[] = incentives.slice(0, 10).map(i => ({
      id: i.id,
      userId: i.userId,
      transactionType: i.pointsEarned > 0 ? 'earn' : 'redeem',
      points: i.pointsEarned > 0 ? i.pointsEarned : i.pointsRedeemed,
      description: i.description,
      createdAt: i.earnedAt,
    }));

    // 사용 가능한 리워드
    const availableRewards = await this.getAvailableRewards(currentBalance);

    // 달성한 업적
    const achievements = await this.getUserAchievements(userId);

    // 다음 마일스톤
    const nextMilestones = await this.getNextMilestones(userId);

    return {
      currentBalance,
      totalEarned,
      totalRedeemed,
      recentTransactions,
      availableRewards,
      achievements,
      nextMilestones,
    };
  }

  /**
   * 사용 가능한 리워드 조회
   */
  private static async getAvailableRewards(currentBalance: number): Promise<any[]> {
    const allRewards = [
      { id: 'coffee', name: '커피 쿠폰', points: 100, category: 'food' },
      { id: 'health_checkup', name: '건강검진 할인', points: 500, category: 'healthcare' },
      { id: 'fitness_tracker', name: '피트니스 트래커', points: 1000, category: 'device' },
      { id: 'gift_card', name: '기프트카드 10,000원', points: 300, category: 'gift' },
      { id: 'premium_subscription', name: '프리미엄 구독 1개월', points: 800, category: 'service' },
    ];

    return allRewards.filter(reward => reward.points <= currentBalance);
  }

  /**
   * 사용자 업적 조회
   */
  private static async getUserAchievements(userId: string): Promise<any[]> {
    // 실제 구현에서는 사용자의 활동 데이터를 기반으로 업적 계산
    return [
      {
        id: 'first_week',
        name: '첫 주 완주',
        description: '7일 연속 건강 데이터 기록',
        earnedAt: '2024-01-07',
        points: 100,
      },
      {
        id: 'data_contributor',
        name: '데이터 기여자',
        description: '총 1000개 이상의 건강 데이터 기록',
        earnedAt: '2024-02-15',
        points: 500,
      },
    ];
  }

  /**
   * 다음 마일스톤 조회
   */
  private static async getNextMilestones(userId: string): Promise<any[]> {
    return [
      {
        id: 'monthly_champion',
        name: '월간 챔피언',
        description: '한 달 동안 매일 건강 데이터 기록',
        progress: 23,
        target: 30,
        reward: 1000,
      },
      {
        id: 'quality_master',
        name: '품질 마스터',
        description: '데이터 품질 점수 95점 이상 달성',
        progress: 87,
        target: 95,
        reward: 800,
      },
    ];
  }

  /**
   * 인센티브 통계 조회
   */
  static async getIncentiveStats(): Promise<{
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    activeUsers: number;
    topContributors: any[];
    popularRewards: any[];
    monthlyTrends: any[];
  }> {
    const allIncentives = await prisma.userIncentive.findMany();

    const totalPointsIssued = allIncentives.reduce((sum, i) => sum + i.pointsEarned, 0);
    const totalPointsRedeemed = allIncentives.reduce((sum, i) => sum + i.pointsRedeemed, 0);

    // 활성 사용자 (최근 30일 내 활동)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await prisma.userIncentive.groupBy({
      by: ['userId'],
      where: {
        earnedAt: { gte: thirtyDaysAgo },
      },
    });

    // 상위 기여자 (포인트 획득 기준)
    const topContributors = await prisma.userIncentive.groupBy({
      by: ['userId'],
      _sum: { pointsEarned: true },
      orderBy: { _sum: { pointsEarned: 'desc' } },
      take: 10,
    });

    return {
      totalPointsIssued,
      totalPointsRedeemed,
      activeUsers: activeUsers.length,
      topContributors: topContributors.map(tc => ({
        userId: tc.userId,
        totalPoints: tc._sum.pointsEarned || 0,
      })),
      popularRewards: [], // 실제 구현에서는 리워드 사용 통계 조회
      monthlyTrends: [], // 실제 구현에서는 월별 트렌드 계산
    };
  }
}