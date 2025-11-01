import prisma from '../config/database';
import { 
  VitalSignRequest, 
  HealthJournalRequest, 
  HealthRecordResponse 
} from '../types/health';

export class HealthService {
  /**
   * 바이탈 사인 기록 생성 (요구사항 2.1, 2.2)
   */
  static async createVitalSign(userId: string, vitalSignData: VitalSignRequest): Promise<HealthRecordResponse> {
    // 건강 기록 생성
    const healthRecord = await prisma.healthRecord.create({
      data: {
        userId,
        recordType: 'vital_sign',
        data: {
          type: vitalSignData.type,
          value: vitalSignData.value,
          unit: vitalSignData.unit,
          measuredAt: vitalSignData.measuredAt,
        },
        recordedDate: new Date(vitalSignData.measuredAt),
      },
    });

    // 바이탈 사인 상세 데이터 생성
    await prisma.vitalSign.create({
      data: {
        healthRecordId: healthRecord.id,
        type: vitalSignData.type,
        value: vitalSignData.value,
        unit: vitalSignData.unit,
        measuredAt: new Date(vitalSignData.measuredAt),
      },
    });

    return {
      id: healthRecord.id,
      userId: healthRecord.userId,
      recordType: healthRecord.recordType,
      data: healthRecord.data,
      recordedDate: healthRecord.recordedDate,
      createdAt: healthRecord.createdAt,
    };
  }

  /**
   * 건강 일지 기록 생성 (요구사항 3.1, 3.2, 3.3, 3.4, 3.5)
   */
  static async createHealthJournal(userId: string, journalData: HealthJournalRequest): Promise<HealthRecordResponse> {
    const healthRecord = await prisma.healthRecord.create({
      data: {
        userId,
        recordType: 'health_journal',
        data: {
          conditionRating: journalData.conditionRating,
          symptoms: journalData.symptoms,
          supplements: journalData.supplements,
          exercise: journalData.exercise,
          notes: journalData.notes,
        },
        recordedDate: new Date(journalData.recordedDate),
      },
    });

    return {
      id: healthRecord.id,
      userId: healthRecord.userId,
      recordType: healthRecord.recordType,
      data: healthRecord.data,
      recordedDate: healthRecord.recordedDate,
      createdAt: healthRecord.createdAt,
    };
  }

  /**
   * 사용자의 바이탈 사인 조회 (요구사항 2.1, 2.2, 2.3, 2.4)
   */
  static async getVitalSigns(
    userId: string, 
    type?: string, 
    startDate?: string, 
    endDate?: string,
    limit: number = 50
  ): Promise<HealthRecordResponse[]> {
    const where: any = {
      userId,
      recordType: 'vital_sign',
    };

    if (type) {
      where.data = {
        path: ['type'],
        equals: type,
      };
    }

    if (startDate || endDate) {
      where.recordedDate = {};
      if (startDate) {
        where.recordedDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.recordedDate.lte = new Date(endDate);
      }
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where,
      orderBy: {
        recordedDate: 'desc',
      },
      take: limit,
      include: {
        vitalSigns: true,
      },
    });

    return healthRecords.map(record => ({
      id: record.id,
      userId: record.userId,
      recordType: record.recordType,
      data: record.data,
      recordedDate: record.recordedDate,
      createdAt: record.createdAt,
    }));
  }

  /**
   * 사용자의 건강 일지 조회 (요구사항 3.1, 3.2, 3.3, 3.4)
   */
  static async getHealthJournals(
    userId: string, 
    startDate?: string, 
    endDate?: string,
    limit: number = 30
  ): Promise<HealthRecordResponse[]> {
    const where: any = {
      userId,
      recordType: 'health_journal',
    };

    if (startDate || endDate) {
      where.recordedDate = {};
      if (startDate) {
        where.recordedDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.recordedDate.lte = new Date(endDate);
      }
    }

    const healthRecords = await prisma.healthRecord.findMany({
      where,
      orderBy: {
        recordedDate: 'desc',
      },
      take: limit,
    });

    return healthRecords.map(record => ({
      id: record.id,
      userId: record.userId,
      recordType: record.recordType,
      data: record.data,
      recordedDate: record.recordedDate,
      createdAt: record.createdAt,
    }));
  }

  /**
   * 바이탈 사인 트렌드 분석 (요구사항 2.3, 2.4)
   */
  static async getVitalSignTrends(
    userId: string, 
    type: string, 
    period: 'daily' | 'weekly' | 'monthly' = 'daily',
    days: number = 30
  ): Promise<{
    type: string;
    period: string;
    data: Array<{
      date: string;
      value: number | { systolic: number; diastolic: number };
      average?: number;
    }>;
    statistics: {
      min: number;
      max: number;
      average: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const vitalSigns = await prisma.healthRecord.findMany({
      where: {
        userId,
        recordType: 'vital_sign',
        recordedDate: {
          gte: startDate,
        },
        data: {
          path: ['type'],
          equals: type,
        },
      },
      orderBy: {
        recordedDate: 'asc',
      },
    });

    // 데이터 그룹화 및 평균 계산
    const groupedData = this.groupVitalSignsByPeriod(vitalSigns, period);
    
    // 통계 계산
    const values = vitalSigns.map(record => {
      const value = record.data as any;
      if (type === 'blood_pressure') {
        return (value.value.systolic + value.value.diastolic) / 2;
      }
      return value.value as number;
    });

    const statistics = this.calculateVitalSignStatistics(values);

    return {
      type,
      period,
      data: groupedData,
      statistics,
    };
  }

  /**
   * 건강 기록 업데이트 (요구사항 2.5)
   */
  static async updateHealthRecord(
    userId: string, 
    recordId: string, 
    updateData: any
  ): Promise<HealthRecordResponse> {
    // 사용자 권한 확인
    const existingRecord = await prisma.healthRecord.findFirst({
      where: {
        id: recordId,
        userId,
      },
    });

    if (!existingRecord) {
      throw new Error('건강 기록을 찾을 수 없거나 접근 권한이 없습니다');
    }

    // 기존 데이터와 업데이트 데이터 병합
    const existingData = existingRecord.data as any;
    const updatedData = {
      ...existingData,
      ...updateData,
    };

    const recordUpdateData: any = {
      data: updatedData,
    };

    // 날짜 업데이트 처리
    if (updateData.measuredAt) {
      recordUpdateData.recordedDate = new Date(updateData.measuredAt);
    } else if (updateData.recordedDate) {
      recordUpdateData.recordedDate = new Date(updateData.recordedDate);
    }

    const updatedRecord = await prisma.healthRecord.update({
      where: { id: recordId },
      data: recordUpdateData,
    });

    // 바이탈 사인인 경우 관련 데이터도 업데이트
    if (existingRecord.recordType === 'vital_sign' && updateData.type) {
      const vitalSignUpdateData: any = {};
      
      if (updateData.type) vitalSignUpdateData.type = updateData.type;
      if (updateData.value !== undefined) vitalSignUpdateData.value = updateData.value;
      if (updateData.unit) vitalSignUpdateData.unit = updateData.unit;
      if (updateData.measuredAt) vitalSignUpdateData.measuredAt = new Date(updateData.measuredAt);

      await prisma.vitalSign.updateMany({
        where: { healthRecordId: recordId },
        data: vitalSignUpdateData,
      });
    }

    return {
      id: updatedRecord.id,
      userId: updatedRecord.userId,
      recordType: updatedRecord.recordType,
      data: updatedRecord.data,
      recordedDate: updatedRecord.recordedDate,
      createdAt: updatedRecord.createdAt,
    };
  }

  /**
   * 건강 기록 삭제
   */
  static async deleteHealthRecord(userId: string, recordId: string): Promise<void> {
    const existingRecord = await prisma.healthRecord.findFirst({
      where: {
        id: recordId,
        userId,
      },
    });

    if (!existingRecord) {
      throw new Error('건강 기록을 찾을 수 없거나 접근 권한이 없습니다');
    }

    await prisma.healthRecord.delete({
      where: { id: recordId },
    });
  }

  /**
   * 대시보드 데이터 집계 (요구사항 4.1, 4.2, 4.3)
   */
  static async getDashboardSummary(userId: string): Promise<{
    healthMetrics: {
      latestVitalSigns: { [key: string]: any };
      averageCondition: number | null;
      totalRecords: number;
      weeklyProgress: {
        vitalSignsCount: number;
        journalEntriesCount: number;
        exerciseSessionsCount: number;
      };
    };
    trends: {
      weightTrend: 'increasing' | 'decreasing' | 'stable';
      conditionTrend: 'improving' | 'declining' | 'stable';
      exerciseFrequency: number;
    };
    goals: {
      weightGoal?: {
        target: number;
        current: number;
        progress: number;
      };
      exerciseGoal?: {
        target: number;
        current: number;
        progress: number;
      };
    };
    todaysTasks: Array<{
      type: 'vital_sign' | 'exercise' | 'medication' | 'journal';
      description: string;
      completed: boolean;
      priority: 'high' | 'medium' | 'low';
    }>;
  }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 최근 30일 데이터 조회
    const [recentVitalSigns, recentJournals, todayRecords] = await Promise.all([
      this.getVitalSigns(userId, undefined, thirtyDaysAgo.toISOString(), undefined, 200),
      this.getHealthJournals(userId, thirtyDaysAgo.toISOString(), undefined, 30),
      prisma.healthRecord.findMany({
        where: {
          userId,
          recordedDate: {
            gte: today,
          },
        },
      }),
    ]);

    // 주간 데이터 조회
    const weeklyVitalSigns = recentVitalSigns.filter(
      record => new Date(record.recordedDate) >= sevenDaysAgo
    );
    const weeklyJournals = recentJournals.filter(
      record => new Date(record.recordedDate) >= sevenDaysAgo
    );

    // 건강 지표 계산
    const healthMetrics = this.calculateHealthMetrics(
      recentVitalSigns,
      recentJournals,
      weeklyVitalSigns,
      weeklyJournals
    );

    // 트렌드 분석
    const trends = this.analyzeTrends(recentVitalSigns, recentJournals);

    // 목표 달성률 계산
    const goals = await this.calculateGoalProgress(userId, recentVitalSigns, recentJournals);

    // 오늘의 할 일 생성
    const todaysTasks = this.generateTodaysTasks(todayRecords, recentVitalSigns, recentJournals);

    return {
      healthMetrics,
      trends,
      goals,
      todaysTasks,
    };
  }

  /**
   * 건강 지표 계산
   */
  private static calculateHealthMetrics(
    recentVitalSigns: any[],
    recentJournals: any[],
    weeklyVitalSigns: any[],
    weeklyJournals: any[]
  ) {
    // 최신 바이탈 사인
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

    // 평균 컨디션 계산
    const conditionRatings = recentJournals
      .map(journal => (journal.data as any).conditionRating)
      .filter(rating => typeof rating === 'number');
    
    const averageCondition = conditionRatings.length > 0 
      ? conditionRatings.reduce((sum, rating) => sum + rating, 0) / conditionRatings.length
      : null;

    // 주간 진행 상황
    const exerciseSessionsCount = weeklyJournals.reduce((count, journal) => {
      const data = journal.data as any;
      return count + (data.exercise ? data.exercise.length : 0);
    }, 0);

    return {
      latestVitalSigns,
      averageCondition: averageCondition ? Math.round(averageCondition * 10) / 10 : null,
      totalRecords: recentVitalSigns.length + recentJournals.length,
      weeklyProgress: {
        vitalSignsCount: weeklyVitalSigns.length,
        journalEntriesCount: weeklyJournals.length,
        exerciseSessionsCount,
      },
    };
  }

  /**
   * 트렌드 분석
   */
  private static analyzeTrends(recentVitalSigns: any[], recentJournals: any[]) {
    // 체중 트렌드
    const weightRecords = recentVitalSigns
      .filter(record => (record.data as any).type === 'weight')
      .sort((a, b) => new Date(a.recordedDate).getTime() - new Date(b.recordedDate).getTime());

    let weightTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (weightRecords.length >= 2) {
      const recent = weightRecords.slice(-3);
      const earlier = weightRecords.slice(0, 3);
      
      if (recent.length > 0 && earlier.length > 0) {
        const recentAvg = recent.reduce((sum, r) => sum + (r.data as any).value, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, r) => sum + (r.data as any).value, 0) / earlier.length;
        
        const difference = recentAvg - earlierAvg;
        if (difference > 1) weightTrend = 'increasing';
        else if (difference < -1) weightTrend = 'decreasing';
      }
    }

    // 컨디션 트렌드
    const conditionRecords = recentJournals
      .map(journal => ({
        rating: (journal.data as any).conditionRating,
        date: journal.recordedDate,
      }))
      .filter(record => typeof record.rating === 'number')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let conditionTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (conditionRecords.length >= 4) {
      const recent = conditionRecords.slice(-2);
      const earlier = conditionRecords.slice(0, 2);
      
      const recentAvg = recent.reduce((sum, r) => sum + r.rating, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, r) => sum + r.rating, 0) / earlier.length;
      
      const difference = recentAvg - earlierAvg;
      if (difference > 0.5) conditionTrend = 'improving';
      else if (difference < -0.5) conditionTrend = 'declining';
    }

    // 운동 빈도 (주간)
    const exerciseFrequency = recentJournals
      .slice(-7)
      .reduce((count, journal) => {
        const data = journal.data as any;
        return count + (data.exercise && data.exercise.length > 0 ? 1 : 0);
      }, 0);

    return {
      weightTrend,
      conditionTrend,
      exerciseFrequency,
    };
  }

  /**
   * 목표 달성률 계산
   */
  private static async calculateGoalProgress(
    _userId: string,
    recentVitalSigns: any[],
    recentJournals: any[]
  ) {
    // 사용자 프로필에서 목표 정보 가져오기 (향후 구현)
    // 현재는 기본 목표로 설정
    const goals: any = {};

    // 체중 목표 (최근 체중 기준)
    const weightRecords = recentVitalSigns
      .filter(record => (record.data as any).type === 'weight')
      .sort((a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime());

    if (weightRecords.length > 0) {
      const currentWeight = (weightRecords[0].data as any).value;
      const targetWeight = currentWeight * 0.95; // 5% 감량 목표 예시
      const progress = Math.max(0, Math.min(100, ((currentWeight - targetWeight) / (currentWeight - targetWeight)) * 100));
      
      goals.weightGoal = {
        target: Math.round(targetWeight * 10) / 10,
        current: Math.round(currentWeight * 10) / 10,
        progress: Math.round(progress * 10) / 10,
      };
    }

    // 운동 목표 (주 3회)
    const weeklyExerciseCount = recentJournals
      .slice(-7)
      .reduce((count, journal) => {
        const data = journal.data as any;
        return count + (data.exercise && data.exercise.length > 0 ? 1 : 0);
      }, 0);

    goals.exerciseGoal = {
      target: 3,
      current: weeklyExerciseCount,
      progress: Math.round((weeklyExerciseCount / 3) * 100),
    };

    return goals;
  }

  /**
   * 오늘의 할 일 생성
   */
  private static generateTodaysTasks(
    todayRecords: any[],
    _recentVitalSigns: any[],
    recentJournals: any[]
  ) {
    const tasks = [];

    // 바이탈 사인 체크
    const todayVitalSigns = todayRecords.filter(record => record.recordType === 'vital_sign');
    if (todayVitalSigns.length === 0) {
      tasks.push({
        type: 'vital_sign' as const,
        description: '오늘의 바이탈 사인 측정하기',
        completed: false,
        priority: 'high' as const,
      });
    }

    // 건강 일지 작성
    const todayJournals = todayRecords.filter(record => record.recordType === 'health_journal');
    if (todayJournals.length === 0) {
      tasks.push({
        type: 'journal' as const,
        description: '오늘의 건강 일지 작성하기',
        completed: false,
        priority: 'medium' as const,
      });
    }

    // 운동 권장 (최근 3일간 운동 기록이 없는 경우)
    const recentExercise = recentJournals
      .slice(-3)
      .some(journal => {
        const data = journal.data as any;
        return data.exercise && data.exercise.length > 0;
      });

    if (!recentExercise) {
      tasks.push({
        type: 'exercise' as const,
        description: '30분 이상 운동하기',
        completed: false,
        priority: 'medium' as const,
      });
    }

    return tasks;
  }

  /**
   * 기간별 바이탈 사인 데이터 그룹화
   */
  private static groupVitalSignsByPeriod(
    vitalSigns: any[], 
    period: 'daily' | 'weekly' | 'monthly'
  ): Array<{
    date: string;
    value: number | { systolic: number; diastolic: number };
    average?: number;
  }> {
    const grouped: { [key: string]: any[] } = {};

    vitalSigns.forEach((record: any) => {
      const date = new Date(record.recordedDate);
      let key: string;

      switch (period) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(record.data);
    });

    return Object.entries(grouped).map(([date, records]) => {
      if (records.length === 1) {
        return {
          date,
          value: records[0].value,
        };
      }

      // 여러 기록이 있는 경우 평균 계산
      const values = records.map((r: any) => {
        if (typeof r.value === 'object' && r.value.systolic) {
          return (r.value.systolic + r.value.diastolic) / 2;
        }
        return r.value;
      });

      const average = values.reduce((sum, val) => sum + val, 0) / values.length;

      return {
        date,
        value: records[0].value, // 첫 번째 값 표시
        average: Math.round(average * 10) / 10,
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * 바이탈 사인 통계 계산
   */
  private static calculateVitalSignStatistics(values: number[]): {
    min: number;
    max: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    if (values.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        trend: 'stable',
      };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    // 트렌드 계산 (최근 30% vs 이전 30%)
    const recentCount = Math.floor(values.length * 0.3);
    if (recentCount < 2) {
      return {
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10,
        average: Math.round(average * 10) / 10,
        trend: 'stable',
      };
    }

    const recentValues = values.slice(-recentCount);
    const earlierValues = values.slice(0, recentCount);

    const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
    const earlierAvg = earlierValues.reduce((sum, val) => sum + val, 0) / earlierValues.length;

    const difference = recentAvg - earlierAvg;
    const threshold = average * 0.05; // 5% 변화를 기준으로 트렌드 판단

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (difference > threshold) {
      trend = 'increasing';
    } else if (difference < -threshold) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }

    return {
      min: Math.round(min * 10) / 10,
      max: Math.round(max * 10) / 10,
      average: Math.round(average * 10) / 10,
      trend,
    };
  }
}