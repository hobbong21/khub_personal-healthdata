import prisma from '../config/database';
import {
  AIInsightsResponse,
  AISummary,
  InsightCard,
  HealthScore,
  QuickStats,
  Recommendation,
  TrendData,
  InsightsMetadata,
  HealthData,
} from '../types/aiInsights';

/**
 * AI Insights Service
 * 
 * 건강 데이터를 분석하여 AI 기반 인사이트, 건강 점수, 트렌드 분석 및 추천사항을 생성합니다.
 * 
 * 주요 기능:
 * - 건강 데이터 분석 및 인사이트 생성
 * - 건강 점수 계산 (0-100)
 * - 트렌드 분석 (7일, 30일, 90일, 1년)
 * - 맞춤형 추천사항 생성
 * - 캐시 관리 (1시간 TTL)
 */
export class AIInsightsService {
  // 캐시 TTL (기본값: 1시간)
  private static readonly CACHE_TTL_SECONDS = parseInt(process.env.AI_INSIGHTS_CACHE_TTL || '3600');
  
  // 최소 데이터 포인트 수
  private static readonly MIN_DATA_POINTS = parseInt(process.env.AI_INSIGHTS_MIN_DATA_POINTS || '3');

  // 캐시 히트율 추적
  private static cacheHits = 0;
  private static cacheMisses = 0;

  /**
   * 메인 통합 메서드: 모든 AI 인사이트 데이터를 가져옵니다
   * 캐시가 유효한 경우 캐시된 데이터를 반환하고, 그렇지 않으면 새로 생성합니다.
   * 
   * @param userId - 사용자 ID
   * @returns AI 인사이트 전체 데이터
   */
  static async getAIInsights(userId: string): Promise<AIInsightsResponse> {
    const startTime = Date.now();
    
    try {
      // 1. 캐시 확인
      const cacheCheckStart = Date.now();
      const cachedInsights = await this.getCachedInsights(userId);
      const cacheCheckDuration = Date.now() - cacheCheckStart;
      
      if (cachedInsights) {
        console.log(`[AI Insights] ✅ 캐시 히트 (userId: ${userId}, 조회 시간: ${cacheCheckDuration}ms)`);
        this.logCacheHitRate(true);
        return cachedInsights;
      }

      console.log(`[AI Insights] ❌ 캐시 미스 (userId: ${userId}, 조회 시간: ${cacheCheckDuration}ms)`);
      this.logCacheHitRate(false);
      console.log(`[AI Insights] 🔄 새로운 인사이트 생성 시작 (userId: ${userId})`);

      // 2. 건강 데이터 조회
      const dataFetchStart = Date.now();
      const healthData = await this.fetchHealthData(userId, 30); // 기본 30일
      const dataFetchDuration = Date.now() - dataFetchStart;
      console.log(`[AI Insights] 📊 데이터 조회 완료 (소요 시간: ${dataFetchDuration}ms)`);

      // 3. 데이터 충분성 확인
      const dataPointsCount = this.countDataPoints(healthData);
      if (dataPointsCount < this.MIN_DATA_POINTS) {
        console.log(`[AI Insights] ⚠️  데이터 부족 (${dataPointsCount}/${this.MIN_DATA_POINTS})`);
        return this.generateInsufficientDataResponse(userId, dataPointsCount);
      }

      // 4. 각 컴포넌트 생성
      const processingStart = Date.now();
      const [summary, insights, healthScore, quickStats, trends] = await Promise.all([
        this.generateSummary(userId, healthData),
        this.generateInsights(userId, healthData),
        this.calculateHealthScore(userId, healthData),
        this.getQuickStats(userId, 7), // 최근 7일
        this.analyzeTrends(userId, 30), // 기본 30일
      ]);
      const processingDuration = Date.now() - processingStart;
      console.log(`[AI Insights] 🧠 인사이트 처리 완료 (소요 시간: ${processingDuration}ms)`);

      // 5. 추천사항 생성 (인사이트 기반)
      const recommendations = await this.generateRecommendations(userId, healthData, insights);

      // 6. 메타데이터 생성
      const metadata: InsightsMetadata = {
        userId,
        generatedAt: new Date(),
        dataPointsAnalyzed: dataPointsCount,
        analysisPeriod: 30,
        cacheExpiry: new Date(Date.now() + this.CACHE_TTL_SECONDS * 1000),
      };

      // 7. 응답 구성
      const response: AIInsightsResponse = {
        summary,
        insights,
        healthScore,
        quickStats,
        recommendations,
        trends,
        metadata,
      };

      // 8. 캐시 저장
      const cacheSaveStart = Date.now();
      await this.cacheInsights(userId, response);
      const cacheSaveDuration = Date.now() - cacheSaveStart;
      console.log(`[AI Insights] 💾 캐시 저장 완료 (소요 시간: ${cacheSaveDuration}ms)`);

      const totalDuration = Date.now() - startTime;
      console.log(`[AI Insights] ✅ 인사이트 생성 완료 (userId: ${userId}, 총 소요 시간: ${totalDuration}ms, 데이터 포인트: ${dataPointsCount})`);
      
      // 성능 메트릭 로깅
      this.logPerformanceMetrics({
        userId,
        totalDuration,
        dataFetchDuration,
        processingDuration,
        cacheSaveDuration,
        dataPointsCount,
      });

      return response;

    } catch (error) {
      const errorDuration = Date.now() - startTime;
      console.error(`[AI Insights] ❌ 인사이트 생성 실패 (userId: ${userId}, 소요 시간: ${errorDuration}ms):`, error);
      throw new Error('AI 인사이트 생성 중 오류가 발생했습니다');
    }
  }

  /**
   * 캐시된 인사이트 조회
   * 
   * @param userId - 사용자 ID
   * @returns 캐시된 인사이트 또는 null
   */
  private static async getCachedInsights(userId: string): Promise<AIInsightsResponse | null> {
    try {
      const cache = await prisma.aIInsightCache.findFirst({
        where: {
          userId,
          expiresAt: {
            gt: new Date(), // 만료되지 않은 캐시만
          },
        },
        orderBy: {
          generatedAt: 'desc',
        },
      });

      if (!cache) {
        return null;
      }

      // JSON 데이터를 AIInsightsResponse로 변환
      const insightsData = cache.insightsData as any;
      
      // Date 객체로 변환
      return {
        ...insightsData,
        summary: {
          ...insightsData.summary,
          lastUpdated: new Date(insightsData.summary.lastUpdated),
        },
        insights: insightsData.insights.map((insight: any) => ({
          ...insight,
          generatedAt: new Date(insight.generatedAt),
        })),
        metadata: {
          ...insightsData.metadata,
          generatedAt: new Date(insightsData.metadata.generatedAt),
          cacheExpiry: new Date(insightsData.metadata.cacheExpiry),
        },
      };
    } catch (error) {
      console.error('[AI Insights] 캐시 조회 실패:', error);
      return null;
    }
  }

  /**
   * 인사이트를 캐시에 저장
   * 
   * @param userId - 사용자 ID
   * @param insights - 저장할 인사이트 데이터
   */
  private static async cacheInsights(userId: string, insights: AIInsightsResponse): Promise<void> {
    try {
      // 기존 캐시 삭제 (선택적)
      await prisma.aIInsightCache.deleteMany({
        where: { userId },
      });

      // 새 캐시 생성
      await prisma.aIInsightCache.create({
        data: {
          userId,
          insightsData: insights as any,
          generatedAt: new Date(),
          expiresAt: insights.metadata.cacheExpiry,
        },
      });

      console.log(`[AI Insights] 캐시 저장 완료 (userId: ${userId})`);
    } catch (error) {
      console.error('[AI Insights] 캐시 저장 실패:', error);
      // 캐시 저장 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

  /**
   * 캐시 삭제
   * 사용자의 캐시된 인사이트를 삭제하여 강제로 새로고침합니다.
   * 
   * @param userId - 사용자 ID
   */
  static async clearCache(userId: string): Promise<void> {
    try {
      await prisma.aIInsightCache.deleteMany({
        where: { userId },
      });

      console.log(`[AI Insights] 캐시 삭제 완료 (userId: ${userId})`);
    } catch (error) {
      console.error('[AI Insights] 캐시 삭제 실패:', error);
      throw new Error('캐시 삭제에 실패했습니다.');
    }
  }

  /**
   * 건강 데이터 조회
   * 
   * @param userId - 사용자 ID
   * @param days - 조회할 일수
   * @returns 건강 데이터
   */
  private static async fetchHealthData(userId: string, days: number): Promise<HealthData> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 병렬로 모든 건강 데이터 조회
    const [vitalSigns, healthRecords] = await Promise.all([
      // 바이탈 사인 조회
      prisma.healthRecord.findMany({
        where: {
          userId,
          recordType: 'vital_sign',
          recordedDate: { gte: startDate },
        },
        include: {
          vitalSigns: true,
        },
        orderBy: { recordedDate: 'desc' },
      }),
      // 건강 기록 조회
      prisma.healthRecord.findMany({
        where: {
          userId,
          recordType: 'health_journal',
          recordedDate: { gte: startDate },
        },
        orderBy: { recordedDate: 'desc' },
      }),
    ]);

    // 데이터 변환
    const vitalSignData = vitalSigns.map(record => {
      const data = record.data as any;
      return {
        id: record.id,
        userId: record.userId,
        bloodPressureSystolic: data.type === 'blood_pressure' ? data.value?.systolic : null,
        bloodPressureDiastolic: data.type === 'blood_pressure' ? data.value?.diastolic : null,
        heartRate: data.type === 'heart_rate' ? data.value : null,
        temperature: data.type === 'temperature' ? data.value : null,
        respiratoryRate: data.type === 'respiratory_rate' ? data.value : null,
        oxygenSaturation: data.type === 'oxygen_saturation' ? data.value : null,
        recordedAt: record.recordedDate,
        createdAt: record.createdAt,
      };
    });

    // 건강 일지에서 수면, 운동, 스트레스 데이터 추출
    const sleepData: any[] = [];
    const exerciseData: any[] = [];
    const stressData: any[] = [];

    healthRecords.forEach(record => {
      const data = record.data as any;
      
      // 수면 데이터
      if (data.sleep) {
        sleepData.push({
          id: record.id,
          userId: record.userId,
          date: record.recordedDate,
          duration: data.sleep.duration || 0,
          quality: data.sleep.quality || null,
          notes: data.sleep.notes || null,
          createdAt: record.createdAt,
        });
      }

      // 운동 데이터
      if (data.exercise && Array.isArray(data.exercise)) {
        data.exercise.forEach((ex: any) => {
          exerciseData.push({
            id: `${record.id}_${ex.type}`,
            userId: record.userId,
            date: record.recordedDate,
            type: ex.type || 'unknown',
            duration: ex.duration || 0,
            intensity: ex.intensity || null,
            caloriesBurned: ex.calories || null,
            notes: ex.notes || null,
            createdAt: record.createdAt,
          });
        });
      }

      // 스트레스 데이터
      if (data.stress) {
        stressData.push({
          id: record.id,
          userId: record.userId,
          date: record.recordedDate,
          level: data.stress.level || 0,
          triggers: data.stress.triggers || null,
          notes: data.stress.notes || null,
          createdAt: record.createdAt,
        });
      }
    });

    return {
      vitalSigns: vitalSignData,
      healthRecords: healthRecords.map(record => ({
        id: record.id,
        userId: record.userId,
        date: record.recordedDate,
        weight: (record.data as any).weight || null,
        height: (record.data as any).height || null,
        bmi: (record.data as any).bmi || null,
        bloodGlucose: (record.data as any).bloodGlucose || null,
        notes: (record.data as any).notes || null,
        createdAt: record.createdAt,
      })),
      sleepData,
      exerciseData,
      stressData,
    };
  }

  /**
   * 데이터 포인트 수 계산
   * 
   * @param healthData - 건강 데이터
   * @returns 총 데이터 포인트 수
   */
  private static countDataPoints(healthData: HealthData): number {
    return (
      healthData.vitalSigns.length +
      healthData.healthRecords.length +
      healthData.sleepData.length +
      healthData.exerciseData.length +
      healthData.stressData.length
    );
  }

  /**
   * 데이터 부족 시 응답 생성
   * 
   * @param userId - 사용자 ID
   * @param dataPointsCount - 현재 데이터 포인트 수
   * @returns 기본 응답
   */
  private static generateInsufficientDataResponse(
    userId: string,
    dataPointsCount: number
  ): AIInsightsResponse {
    const now = new Date();
    
    return {
      summary: {
        text: '건강 데이터가 충분하지 않아 상세한 분석을 제공할 수 없습니다. 더 많은 건강 데이터를 입력하시면 맞춤형 인사이트를 받아보실 수 있습니다.',
        period: '최근 7일',
        lastUpdated: now,
        confidence: 0,
        keyFindings: {
          positive: [],
          concerning: ['데이터 부족으로 분석이 제한됩니다'],
        },
      },
      insights: [
        {
          id: 'insufficient-data',
          type: 'info',
          priority: 'high',
          icon: 'info',
          title: '더 많은 데이터가 필요합니다',
          description: `현재 ${dataPointsCount}개의 데이터 포인트가 있습니다. 최소 ${this.MIN_DATA_POINTS}개 이상의 건강 데이터를 입력하시면 AI 기반 인사이트를 받아보실 수 있습니다.`,
          actionText: '건강 데이터 입력하기',
          actionLink: '/health/records',
          relatedMetrics: [],
          generatedAt: now,
        },
      ],
      healthScore: {
        score: 0,
        category: 'poor',
        categoryLabel: '데이터 부족',
        previousScore: 0,
        change: 0,
        changeDirection: 'stable',
        components: {
          bloodPressure: { score: 0, weight: 0.25 },
          heartRate: { score: 0, weight: 0.20 },
          sleep: { score: 0, weight: 0.25 },
          exercise: { score: 0, weight: 0.20 },
          stress: { score: 0, weight: 0.10 },
        },
      },
      quickStats: {
        bloodPressure: { value: '데이터 없음', unit: 'mmHg' },
        heartRate: { value: 0, unit: 'bpm' },
        sleep: { value: 0, unit: '시간' },
        exercise: { value: 0, unit: '분/주' },
      },
      recommendations: [
        {
          id: 'rec-data-entry',
          icon: '📝',
          title: '건강 데이터 입력 시작하기',
          description: '바이탈 사인, 수면, 운동 등의 건강 데이터를 꾸준히 입력하세요.',
          category: 'exercise',
          priority: 1,
        },
      ],
      trends: [],
      metadata: {
        userId,
        generatedAt: now,
        dataPointsAnalyzed: dataPointsCount,
        analysisPeriod: 7,
        cacheExpiry: new Date(now.getTime() + this.CACHE_TTL_SECONDS * 1000),
      },
    };
  }

  /**
   * 건강 점수 계산 (0-100)
   * 
   * 가중치:
   * - 혈압: 25%
   * - 심박수: 20%
   * - 수면: 25%
   * - 운동: 20%
   * - 스트레스: 10%
   * 
   * @param userId - 사용자 ID
   * @param healthData - 건강 데이터
   * @returns 건강 점수
   */
  private static async calculateHealthScore(userId: string, healthData: HealthData): Promise<HealthScore> {
    // 각 지표별 점수 계산
    const bpScore = this.calculateBloodPressureScore(healthData);
    const hrScore = this.calculateHeartRateScore(healthData);
    const sleepScore = this.calculateSleepScore(healthData);
    const exerciseScore = this.calculateExerciseScore(healthData);
    const stressScore = this.calculateStressScore(healthData);

    // 가중치 적용
    const weights = {
      bloodPressure: 0.25,
      heartRate: 0.20,
      sleep: 0.25,
      exercise: 0.20,
      stress: 0.10,
    };

    // 총점 계산
    const totalScore = Math.round(
      bpScore * weights.bloodPressure +
      hrScore * weights.heartRate +
      sleepScore * weights.sleep +
      exerciseScore * weights.exercise +
      stressScore * weights.stress
    );

    // 이전 주 점수 계산 (비교용)
    const previousHealthData = await this.fetchHealthData(userId, 14); // 14일 데이터
    const previousWeekData = this.filterDataByDateRange(
      previousHealthData,
      14,
      7
    ); // 7-14일 전 데이터
    
    const prevBpScore = this.calculateBloodPressureScore(previousWeekData);
    const prevHrScore = this.calculateHeartRateScore(previousWeekData);
    const prevSleepScore = this.calculateSleepScore(previousWeekData);
    const prevExerciseScore = this.calculateExerciseScore(previousWeekData);
    const prevStressScore = this.calculateStressScore(previousWeekData);

    const previousScore = Math.round(
      prevBpScore * weights.bloodPressure +
      prevHrScore * weights.heartRate +
      prevSleepScore * weights.sleep +
      prevExerciseScore * weights.exercise +
      prevStressScore * weights.stress
    );

    // 변화 계산
    const change = totalScore - previousScore;
    let changeDirection: 'up' | 'down' | 'stable' = 'stable';
    if (change > 2) changeDirection = 'up';
    else if (change < -2) changeDirection = 'down';

    // 카테고리 분류
    let category: 'excellent' | 'good' | 'fair' | 'poor';
    let categoryLabel: string;

    if (totalScore >= 81) {
      category = 'excellent';
      categoryLabel = '우수';
    } else if (totalScore >= 61) {
      category = 'good';
      categoryLabel = '양호';
    } else if (totalScore >= 41) {
      category = 'fair';
      categoryLabel = '보통';
    } else {
      category = 'poor';
      categoryLabel = '주의 필요';
    }

    return {
      score: totalScore,
      category,
      categoryLabel,
      previousScore,
      change,
      changeDirection,
      components: {
        bloodPressure: { score: bpScore, weight: weights.bloodPressure },
        heartRate: { score: hrScore, weight: weights.heartRate },
        sleep: { score: sleepScore, weight: weights.sleep },
        exercise: { score: exerciseScore, weight: weights.exercise },
        stress: { score: stressScore, weight: weights.stress },
      },
    };
  }

  /**
   * 혈압 점수 계산 (0-100)
   * 최적: 120/80 = 100점
   * 고혈압: >140/90 = 0점
   */
  private static calculateBloodPressureScore(healthData: HealthData): number {
    const bpReadings = healthData.vitalSigns.filter(
      vs => vs.bloodPressureSystolic !== null && vs.bloodPressureDiastolic !== null
    );

    if (bpReadings.length === 0) return 50; // 데이터 없으면 중간 점수

    // 평균 계산
    const avgSystolic = bpReadings.reduce((sum, vs) => sum + (vs.bloodPressureSystolic || 0), 0) / bpReadings.length;
    const avgDiastolic = bpReadings.reduce((sum, vs) => sum + (vs.bloodPressureDiastolic || 0), 0) / bpReadings.length;

    // 점수 계산
    let score = 100;

    // 수축기 혈압 평가
    if (avgSystolic <= 120) {
      score -= 0;
    } else if (avgSystolic <= 130) {
      score -= 10;
    } else if (avgSystolic <= 140) {
      score -= 30;
    } else if (avgSystolic <= 160) {
      score -= 60;
    } else {
      score -= 80;
    }

    // 이완기 혈압 평가
    if (avgDiastolic <= 80) {
      score -= 0;
    } else if (avgDiastolic <= 85) {
      score -= 10;
    } else if (avgDiastolic <= 90) {
      score -= 30;
    } else if (avgDiastolic <= 100) {
      score -= 60;
    } else {
      score -= 80;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 심박수 점수 계산 (0-100)
   * 최적: 60-80 bpm = 100점
   */
  private static calculateHeartRateScore(healthData: HealthData): number {
    const hrReadings = healthData.vitalSigns.filter(vs => vs.heartRate !== null);

    if (hrReadings.length === 0) return 50;

    const avgHeartRate = hrReadings.reduce((sum, vs) => sum + (vs.heartRate || 0), 0) / hrReadings.length;

    // 점수 계산
    if (avgHeartRate >= 60 && avgHeartRate <= 80) {
      return 100;
    } else if (avgHeartRate >= 50 && avgHeartRate <= 90) {
      return 80;
    } else if (avgHeartRate >= 40 && avgHeartRate <= 100) {
      return 60;
    } else if (avgHeartRate >= 35 && avgHeartRate <= 110) {
      return 40;
    } else {
      return 20;
    }
  }

  /**
   * 수면 점수 계산 (0-100)
   * 최적: 7-9시간 = 100점
   */
  private static calculateSleepScore(healthData: HealthData): number {
    if (healthData.sleepData.length === 0) return 50;

    const avgSleepHours = healthData.sleepData.reduce((sum, sleep) => sum + sleep.duration, 0) / healthData.sleepData.length;

    // 점수 계산
    if (avgSleepHours >= 7 && avgSleepHours <= 9) {
      return 100;
    } else if (avgSleepHours >= 6 && avgSleepHours <= 10) {
      return 80;
    } else if (avgSleepHours >= 5 && avgSleepHours <= 11) {
      return 60;
    } else if (avgSleepHours >= 4 && avgSleepHours <= 12) {
      return 40;
    } else {
      return 20;
    }
  }

  /**
   * 운동 점수 계산 (0-100)
   * 최적: ≥150분/주 = 100점
   */
  private static calculateExerciseScore(healthData: HealthData): number {
    if (healthData.exerciseData.length === 0) return 30; // 운동 없으면 낮은 점수

    // 주간 총 운동 시간 계산
    const totalMinutes = healthData.exerciseData.reduce((sum, ex) => sum + ex.duration, 0);
    
    // 데이터 기간 계산 (일수)
    const dates = healthData.exerciseData.map(ex => new Date(ex.date).getTime());
    const daysCovered = dates.length > 0 
      ? (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24) + 1
      : 7;
    
    // 주간 평균으로 환산
    const weeklyMinutes = (totalMinutes / daysCovered) * 7;

    // 점수 계산
    if (weeklyMinutes >= 150) {
      return 100;
    } else if (weeklyMinutes >= 100) {
      return 80;
    } else if (weeklyMinutes >= 60) {
      return 60;
    } else if (weeklyMinutes >= 30) {
      return 40;
    } else {
      return 20;
    }
  }

  /**
   * 스트레스 점수 계산 (0-100)
   * 최적: 레벨 1-3 = 100점
   * 높음: 레벨 8-10 = 0점
   */
  private static calculateStressScore(healthData: HealthData): number {
    if (healthData.stressData.length === 0) return 50;

    const avgStressLevel = healthData.stressData.reduce((sum, stress) => sum + stress.level, 0) / healthData.stressData.length;

    // 점수 계산 (스트레스가 낮을수록 높은 점수)
    if (avgStressLevel <= 3) {
      return 100;
    } else if (avgStressLevel <= 5) {
      return 70;
    } else if (avgStressLevel <= 7) {
      return 40;
    } else {
      return 10;
    }
  }

  /**
   * 날짜 범위로 데이터 필터링
   */
  private static filterDataByDateRange(healthData: HealthData, startDaysAgo: number, endDaysAgo: number): HealthData {
    const now = new Date();
    const startDate = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() - endDaysAgo * 24 * 60 * 60 * 1000);

    return {
      vitalSigns: healthData.vitalSigns.filter(vs => {
        const date = new Date(vs.recordedAt);
        return date >= endDate && date < startDate;
      }),
      healthRecords: healthData.healthRecords.filter(hr => {
        const date = new Date(hr.date);
        return date >= endDate && date < startDate;
      }),
      sleepData: healthData.sleepData.filter(sd => {
        const date = new Date(sd.date);
        return date >= endDate && date < startDate;
      }),
      exerciseData: healthData.exerciseData.filter(ed => {
        const date = new Date(ed.date);
        return date >= endDate && date < startDate;
      }),
      stressData: healthData.stressData.filter(sd => {
        const date = new Date(sd.date);
        return date >= endDate && date < startDate;
      }),
    };
  }

  /**
   * 인사이트 카드 생성
   * 
   * 건강 데이터를 분석하여 4가지 타입의 인사이트 생성:
   * - positive: 긍정적인 건강 개선
   * - warning: 주의가 필요한 상황
   * - alert: 즉각적인 조치가 필요한 상황
   * - info: 일반 정보
   * 
   * @param userId - 사용자 ID
   * @param healthData - 건강 데이터
   * @returns 인사이트 카드 배열
   */
  private static async generateInsights(userId: string, healthData: HealthData): Promise<InsightCard[]> {
    const insights: InsightCard[] = [];
    const now = new Date();

    // 1. 혈압 인사이트
    const bpInsights = this.analyzeBloodPressure(healthData, now);
    insights.push(...bpInsights);

    // 2. 심박수 인사이트
    const hrInsights = this.analyzeHeartRate(healthData, now);
    insights.push(...hrInsights);

    // 3. 수면 인사이트
    const sleepInsights = this.analyzeSleep(healthData, now);
    insights.push(...sleepInsights);

    // 4. 운동 인사이트
    const exerciseInsights = this.analyzeExercise(healthData, now);
    insights.push(...exerciseInsights);

    // 5. 스트레스 인사이트
    const stressInsights = this.analyzeStress(healthData, now);
    insights.push(...stressInsights);

    // 우선순위 순으로 정렬 (high > medium > low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return insights;
  }

  /**
   * 혈압 분석
   */
  private static analyzeBloodPressure(healthData: HealthData, now: Date): InsightCard[] {
    const insights: InsightCard[] = [];
    const bpReadings = healthData.vitalSigns.filter(
      vs => vs.bloodPressureSystolic !== null && vs.bloodPressureDiastolic !== null
    );

    if (bpReadings.length === 0) return insights;

    const avgSystolic = bpReadings.reduce((sum, vs) => sum + (vs.bloodPressureSystolic || 0), 0) / bpReadings.length;
    const avgDiastolic = bpReadings.reduce((sum, vs) => sum + (vs.bloodPressureDiastolic || 0), 0) / bpReadings.length;

    // 고혈압 경고
    if (avgSystolic > 140 || avgDiastolic > 90) {
      insights.push({
        id: `bp-alert-${now.getTime()}`,
        type: 'alert',
        priority: 'high',
        icon: '⚠️',
        title: '혈압이 높습니다',
        description: `평균 혈압이 ${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg로 정상 범위(120/80)를 초과합니다. 의사와 상담하시기 바랍니다.`,
        actionText: '의료 기록 확인',
        actionLink: '/health/medical-records',
        relatedMetrics: ['blood_pressure'],
        generatedAt: now,
      });
    }
    // 경계성 고혈압
    else if (avgSystolic > 130 || avgDiastolic > 85) {
      insights.push({
        id: `bp-warning-${now.getTime()}`,
        type: 'warning',
        priority: 'medium',
        icon: '⚡',
        title: '혈압 관리가 필요합니다',
        description: `평균 혈압이 ${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg로 약간 높습니다. 생활습관 개선을 권장합니다.`,
        actionText: '건강 팁 보기',
        actionLink: '/health/tips',
        relatedMetrics: ['blood_pressure'],
        generatedAt: now,
      });
    }
    // 정상 혈압
    else if (avgSystolic <= 120 && avgDiastolic <= 80) {
      insights.push({
        id: `bp-positive-${now.getTime()}`,
        type: 'positive',
        priority: 'low',
        icon: '✅',
        title: '혈압이 정상 범위입니다',
        description: `평균 혈압 ${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg로 건강한 상태를 유지하고 있습니다.`,
        actionText: '트렌드 보기',
        actionLink: '/health/trends',
        relatedMetrics: ['blood_pressure'],
        generatedAt: now,
      });
    }

    return insights;
  }

  /**
   * 심박수 분석
   */
  private static analyzeHeartRate(healthData: HealthData, now: Date): InsightCard[] {
    const insights: InsightCard[] = [];
    const hrReadings = healthData.vitalSigns.filter(vs => vs.heartRate !== null);

    if (hrReadings.length === 0) return insights;

    const avgHeartRate = hrReadings.reduce((sum, vs) => sum + (vs.heartRate || 0), 0) / hrReadings.length;

    // 빈맥 (심박수 과다)
    if (avgHeartRate > 100) {
      insights.push({
        id: `hr-alert-${now.getTime()}`,
        type: 'alert',
        priority: 'high',
        icon: '💓',
        title: '심박수가 높습니다',
        description: `평균 심박수가 ${Math.round(avgHeartRate)} bpm으로 정상 범위(60-100)를 초과합니다. 스트레스나 카페인 섭취를 줄이고, 필요시 의사와 상담하세요.`,
        actionText: '바이탈 사인 확인',
        actionLink: '/health/vital-signs',
        relatedMetrics: ['heart_rate'],
        generatedAt: now,
      });
    }
    // 서맥 (심박수 과소)
    else if (avgHeartRate < 50) {
      insights.push({
        id: `hr-alert-low-${now.getTime()}`,
        type: 'alert',
        priority: 'high',
        icon: '💓',
        title: '심박수가 낮습니다',
        description: `평균 심박수가 ${Math.round(avgHeartRate)} bpm으로 정상 범위(60-100)보다 낮습니다. 운동선수가 아니라면 의사와 상담하세요.`,
        actionText: '바이탈 사인 확인',
        actionLink: '/health/vital-signs',
        relatedMetrics: ['heart_rate'],
        generatedAt: now,
      });
    }
    // 정상 심박수
    else if (avgHeartRate >= 60 && avgHeartRate <= 80) {
      insights.push({
        id: `hr-positive-${now.getTime()}`,
        type: 'positive',
        priority: 'low',
        icon: '❤️',
        title: '심박수가 이상적입니다',
        description: `평균 심박수 ${Math.round(avgHeartRate)} bpm으로 건강한 심혈관 상태를 보이고 있습니다.`,
        actionText: '트렌드 보기',
        actionLink: '/health/trends',
        relatedMetrics: ['heart_rate'],
        generatedAt: now,
      });
    }

    return insights;
  }

  /**
   * 수면 분석
   */
  private static analyzeSleep(healthData: HealthData, now: Date): InsightCard[] {
    const insights: InsightCard[] = [];

    if (healthData.sleepData.length === 0) return insights;

    const avgSleepHours = healthData.sleepData.reduce((sum, sleep) => sum + sleep.duration, 0) / healthData.sleepData.length;

    // 수면 부족
    if (avgSleepHours < 6) {
      insights.push({
        id: `sleep-warning-${now.getTime()}`,
        type: 'warning',
        priority: 'medium',
        icon: '😴',
        title: '수면 시간이 부족합니다',
        description: `평균 수면 시간이 ${avgSleepHours.toFixed(1)}시간으로 권장 시간(7-9시간)보다 짧습니다. 충분한 수면은 건강 유지에 필수적입니다.`,
        actionText: '수면 개선 팁',
        actionLink: '/health/tips',
        relatedMetrics: ['sleep'],
        generatedAt: now,
      });
    }
    // 과다 수면
    else if (avgSleepHours > 10) {
      insights.push({
        id: `sleep-warning-excess-${now.getTime()}`,
        type: 'warning',
        priority: 'medium',
        icon: '😴',
        title: '수면 시간이 과도합니다',
        description: `평균 수면 시간이 ${avgSleepHours.toFixed(1)}시간으로 권장 시간(7-9시간)보다 깁니다. 과다 수면은 피로감을 유발할 수 있습니다.`,
        actionText: '수면 패턴 확인',
        actionLink: '/health/sleep',
        relatedMetrics: ['sleep'],
        generatedAt: now,
      });
    }
    // 이상적인 수면
    else if (avgSleepHours >= 7 && avgSleepHours <= 9) {
      insights.push({
        id: `sleep-positive-${now.getTime()}`,
        type: 'positive',
        priority: 'low',
        icon: '🌙',
        title: '수면 패턴이 우수합니다',
        description: `평균 ${avgSleepHours.toFixed(1)}시간의 수면으로 이상적인 수면 패턴을 유지하고 있습니다.`,
        actionText: '수면 기록 보기',
        actionLink: '/health/sleep',
        relatedMetrics: ['sleep'],
        generatedAt: now,
      });
    }

    return insights;
  }

  /**
   * 운동 분석
   */
  private static analyzeExercise(healthData: HealthData, now: Date): InsightCard[] {
    const insights: InsightCard[] = [];

    if (healthData.exerciseData.length === 0) {
      insights.push({
        id: `exercise-warning-none-${now.getTime()}`,
        type: 'warning',
        priority: 'medium',
        icon: '🏃',
        title: '운동 기록이 없습니다',
        description: '최근 운동 기록이 없습니다. 주 150분 이상의 중강도 운동을 권장합니다.',
        actionText: '운동 계획 세우기',
        actionLink: '/health/exercise',
        relatedMetrics: ['exercise'],
        generatedAt: now,
      });
      return insights;
    }

    // 주간 총 운동 시간 계산
    const totalMinutes = healthData.exerciseData.reduce((sum, ex) => sum + ex.duration, 0);
    const dates = healthData.exerciseData.map(ex => new Date(ex.date).getTime());
    const daysCovered = dates.length > 0 
      ? (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24) + 1
      : 7;
    const weeklyMinutes = (totalMinutes / daysCovered) * 7;

    // 운동 부족
    if (weeklyMinutes < 150) {
      insights.push({
        id: `exercise-warning-${now.getTime()}`,
        type: 'warning',
        priority: 'medium',
        icon: '🏃',
        title: '운동량이 부족합니다',
        description: `주간 운동 시간이 약 ${Math.round(weeklyMinutes)}분으로 권장량(150분)에 미치지 못합니다. 규칙적인 운동을 시작해보세요.`,
        actionText: '운동 계획 세우기',
        actionLink: '/health/exercise',
        relatedMetrics: ['exercise'],
        generatedAt: now,
      });
    }
    // 충분한 운동
    else {
      insights.push({
        id: `exercise-positive-${now.getTime()}`,
        type: 'positive',
        priority: 'low',
        icon: '💪',
        title: '운동을 꾸준히 하고 있습니다',
        description: `주간 약 ${Math.round(weeklyMinutes)}분의 운동으로 건강한 생활습관을 유지하고 있습니다. 계속 이어가세요!`,
        actionText: '운동 기록 보기',
        actionLink: '/health/exercise',
        relatedMetrics: ['exercise'],
        generatedAt: now,
      });
    }

    return insights;
  }

  /**
   * 스트레스 분석
   */
  private static analyzeStress(healthData: HealthData, now: Date): InsightCard[] {
    const insights: InsightCard[] = [];

    if (healthData.stressData.length === 0) return insights;

    const avgStressLevel = healthData.stressData.reduce((sum, stress) => sum + stress.level, 0) / healthData.stressData.length;

    // 높은 스트레스
    if (avgStressLevel > 7) {
      insights.push({
        id: `stress-alert-${now.getTime()}`,
        type: 'alert',
        priority: 'high',
        icon: '😰',
        title: '스트레스 수준이 높습니다',
        description: `평균 스트레스 레벨이 ${avgStressLevel.toFixed(1)}/10으로 높은 편입니다. 명상, 요가, 또는 전문가 상담을 고려해보세요.`,
        actionText: '스트레스 관리 팁',
        actionLink: '/health/tips',
        relatedMetrics: ['stress'],
        generatedAt: now,
      });
    }
    // 중간 스트레스
    else if (avgStressLevel > 5) {
      insights.push({
        id: `stress-warning-${now.getTime()}`,
        type: 'warning',
        priority: 'medium',
        icon: '😓',
        title: '스트레스 관리가 필요합니다',
        description: `평균 스트레스 레벨이 ${avgStressLevel.toFixed(1)}/10입니다. 휴식과 이완 활동을 늘려보세요.`,
        actionText: '스트레스 관리 팁',
        actionLink: '/health/tips',
        relatedMetrics: ['stress'],
        generatedAt: now,
      });
    }
    // 낮은 스트레스
    else {
      insights.push({
        id: `stress-positive-${now.getTime()}`,
        type: 'positive',
        priority: 'low',
        icon: '😊',
        title: '스트레스를 잘 관리하고 있습니다',
        description: `평균 스트레스 레벨 ${avgStressLevel.toFixed(1)}/10으로 건강한 정신 상태를 유지하고 있습니다.`,
        actionText: '스트레스 기록 보기',
        actionLink: '/health/stress',
        relatedMetrics: ['stress'],
        generatedAt: now,
      });
    }

    return insights;
  }

  /**
   * AI 요약 생성
   * 
   * 최근 7일간의 건강 데이터를 분석하여 자연어 요약을 생성합니다.
   * 
   * @param userId - 사용자 ID
   * @param healthData - 건강 데이터
   * @returns AI 요약
   */
  private static async generateSummary(userId: string, healthData: HealthData): Promise<AISummary> {
    const now = new Date();
    const positive: string[] = [];
    const concerning: string[] = [];

    // 1. 혈압 분석
    const bpReadings = healthData.vitalSigns.filter(
      vs => vs.bloodPressureSystolic !== null && vs.bloodPressureDiastolic !== null
    );
    if (bpReadings.length > 0) {
      const avgSystolic = bpReadings.reduce((sum, vs) => sum + (vs.bloodPressureSystolic || 0), 0) / bpReadings.length;
      const avgDiastolic = bpReadings.reduce((sum, vs) => sum + (vs.bloodPressureDiastolic || 0), 0) / bpReadings.length;
      
      if (avgSystolic <= 120 && avgDiastolic <= 80) {
        positive.push(`혈압이 정상 범위(${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg)를 유지하고 있습니다`);
      } else if (avgSystolic > 140 || avgDiastolic > 90) {
        concerning.push(`혈압이 높습니다(${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg). 의사와 상담이 필요합니다`);
      } else {
        concerning.push(`혈압이 약간 높은 편입니다(${Math.round(avgSystolic)}/${Math.round(avgDiastolic)} mmHg)`);
      }
    }

    // 2. 심박수 분석
    const hrReadings = healthData.vitalSigns.filter(vs => vs.heartRate !== null);
    if (hrReadings.length > 0) {
      const avgHeartRate = hrReadings.reduce((sum, vs) => sum + (vs.heartRate || 0), 0) / hrReadings.length;
      
      if (avgHeartRate >= 60 && avgHeartRate <= 80) {
        positive.push(`심박수가 이상적인 범위(${Math.round(avgHeartRate)} bpm)입니다`);
      } else if (avgHeartRate > 100 || avgHeartRate < 50) {
        concerning.push(`심박수가 비정상 범위(${Math.round(avgHeartRate)} bpm)입니다`);
      }
    }

    // 3. 수면 분석
    if (healthData.sleepData.length > 0) {
      const avgSleepHours = healthData.sleepData.reduce((sum, sleep) => sum + sleep.duration, 0) / healthData.sleepData.length;
      
      if (avgSleepHours >= 7 && avgSleepHours <= 9) {
        positive.push(`충분한 수면(평균 ${avgSleepHours.toFixed(1)}시간)을 취하고 있습니다`);
      } else if (avgSleepHours < 6) {
        concerning.push(`수면 시간이 부족합니다(평균 ${avgSleepHours.toFixed(1)}시간)`);
      } else if (avgSleepHours > 10) {
        concerning.push(`수면 시간이 과도합니다(평균 ${avgSleepHours.toFixed(1)}시간)`);
      }
    } else {
      concerning.push('수면 데이터가 기록되지 않았습니다');
    }

    // 4. 운동 분석
    if (healthData.exerciseData.length > 0) {
      const totalMinutes = healthData.exerciseData.reduce((sum, ex) => sum + ex.duration, 0);
      const dates = healthData.exerciseData.map(ex => new Date(ex.date).getTime());
      const daysCovered = dates.length > 0 
        ? (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24) + 1
        : 7;
      const weeklyMinutes = (totalMinutes / daysCovered) * 7;
      
      if (weeklyMinutes >= 150) {
        positive.push(`규칙적인 운동(주 ${Math.round(weeklyMinutes)}분)을 하고 있습니다`);
      } else {
        concerning.push(`운동량이 부족합니다(주 ${Math.round(weeklyMinutes)}분, 권장 150분)`);
      }
    } else {
      concerning.push('운동 기록이 없습니다');
    }

    // 5. 스트레스 분석
    if (healthData.stressData.length > 0) {
      const avgStressLevel = healthData.stressData.reduce((sum, stress) => sum + stress.level, 0) / healthData.stressData.length;
      
      if (avgStressLevel <= 3) {
        positive.push(`스트레스를 잘 관리하고 있습니다(레벨 ${avgStressLevel.toFixed(1)}/10)`);
      } else if (avgStressLevel > 7) {
        concerning.push(`스트레스 수준이 높습니다(레벨 ${avgStressLevel.toFixed(1)}/10)`);
      } else if (avgStressLevel > 5) {
        concerning.push(`스트레스 관리가 필요합니다(레벨 ${avgStressLevel.toFixed(1)}/10)`);
      }
    }

    // 6. 전반적인 상태 평가
    let overallStatus: string;
    const positiveCount = positive.length;
    const concerningCount = concerning.length;
    
    if (positiveCount > concerningCount * 2) {
      overallStatus = '매우 양호';
    } else if (positiveCount > concerningCount) {
      overallStatus = '양호';
    } else if (positiveCount === concerningCount) {
      overallStatus = '보통';
    } else {
      overallStatus = '주의 필요';
    }

    // 7. 요약 텍스트 생성
    let summaryText = `최근 7일간의 건강 데이터를 분석한 결과, 전반적인 건강 상태는 ${overallStatus}입니다. `;
    
    if (positive.length > 0) {
      summaryText += `긍정적인 측면으로는 ${positive.slice(0, 2).join(', ')}. `;
    }
    
    if (concerning.length > 0) {
      summaryText += `개선이 필요한 부분은 ${concerning.slice(0, 2).join(', ')}입니다. `;
    }
    
    summaryText += '꾸준한 건강 관리를 통해 더 나은 건강 상태를 유지하세요.';

    // 8. 신뢰도 계산
    const totalDataPoints = this.countDataPoints(healthData);
    let confidence: number;
    
    if (totalDataPoints >= 20) {
      confidence = 0.9;
    } else if (totalDataPoints >= 10) {
      confidence = 0.7;
    } else if (totalDataPoints >= 5) {
      confidence = 0.5;
    } else {
      confidence = 0.3;
    }

    return {
      text: summaryText,
      period: '최근 7일',
      lastUpdated: now,
      confidence,
      keyFindings: {
        positive,
        concerning,
      },
    };
  }

  /**
   * 맞춤형 추천사항 생성
   * 
   * 인사이트를 기반으로 3-5개의 실행 가능한 추천사항을 생성합니다.
   * 
   * @param userId - 사용자 ID
   * @param healthData - 건강 데이터
   * @param insights - 생성된 인사이트
   * @returns 추천사항 배열
   */
  private static async generateRecommendations(
    userId: string,
    healthData: HealthData,
    insights: InsightCard[]
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    let priority = 1;

    // 1. 고우선순위 인사이트 기반 추천
    const highPriorityInsights = insights.filter(i => i.priority === 'high');
    
    for (const insight of highPriorityInsights) {
      if (insight.relatedMetrics.includes('blood_pressure')) {
        recommendations.push({
          id: `rec-bp-${priority}`,
          icon: '🩺',
          title: '혈압 관리',
          description: '저염식 식단을 유지하고, 규칙적인 유산소 운동을 하세요. 매일 같은 시간에 혈압을 측정하여 변화를 모니터링하세요.',
          category: 'nutrition',
          priority: priority++,
        });
      }
      
      if (insight.relatedMetrics.includes('heart_rate')) {
        recommendations.push({
          id: `rec-hr-${priority}`,
          icon: '💓',
          title: '심박수 안정화',
          description: '카페인 섭취를 줄이고, 충분한 수분을 섭취하세요. 스트레스 관리를 위해 명상이나 심호흡 운동을 시도해보세요.',
          category: 'stress',
          priority: priority++,
        });
      }
      
      if (insight.relatedMetrics.includes('stress')) {
        recommendations.push({
          id: `rec-stress-${priority}`,
          icon: '🧘',
          title: '스트레스 관리',
          description: '매일 10-15분 명상이나 요가를 실천하세요. 충분한 휴식과 취미 활동으로 마음의 여유를 가지세요.',
          category: 'stress',
          priority: priority++,
        });
      }
    }

    // 2. 수면 추천
    if (healthData.sleepData.length > 0) {
      const avgSleepHours = healthData.sleepData.reduce((sum, sleep) => sum + sleep.duration, 0) / healthData.sleepData.length;
      
      if (avgSleepHours < 7) {
        recommendations.push({
          id: `rec-sleep-${priority}`,
          icon: '🌙',
          title: '수면 개선',
          description: '매일 같은 시간에 잠자리에 들고 일어나세요. 취침 1시간 전에는 전자기기 사용을 피하고, 편안한 수면 환경을 조성하세요.',
          category: 'sleep',
          priority: priority++,
        });
      }
    } else {
      recommendations.push({
        id: `rec-sleep-track-${priority}`,
        icon: '📊',
        title: '수면 기록 시작',
        description: '수면 패턴을 파악하기 위해 매일 수면 시간을 기록하세요. 규칙적인 수면 습관이 건강의 기초입니다.',
        category: 'sleep',
        priority: priority++,
      });
    }

    // 3. 운동 추천
    if (healthData.exerciseData.length === 0) {
      recommendations.push({
        id: `rec-exercise-start-${priority}`,
        icon: '🏃',
        title: '운동 시작하기',
        description: '하루 30분 걷기부터 시작하세요. 주 5일, 총 150분의 중강도 운동을 목표로 점진적으로 늘려가세요.',
        category: 'exercise',
        priority: priority++,
      });
    } else {
      const totalMinutes = healthData.exerciseData.reduce((sum, ex) => sum + ex.duration, 0);
      const dates = healthData.exerciseData.map(ex => new Date(ex.date).getTime());
      const daysCovered = dates.length > 0 
        ? (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24) + 1
        : 7;
      const weeklyMinutes = (totalMinutes / daysCovered) * 7;
      
      if (weeklyMinutes < 150) {
        recommendations.push({
          id: `rec-exercise-increase-${priority}`,
          icon: '💪',
          title: '운동량 늘리기',
          description: `현재 주 ${Math.round(weeklyMinutes)}분 운동 중입니다. 주 150분 목표를 위해 매일 10분씩 더 운동해보세요. 계단 오르기, 스트레칭 등 간단한 활동도 도움이 됩니다.`,
          category: 'exercise',
          priority: priority++,
        });
      }
    }

    // 4. 수분 섭취 추천 (기본 추천)
    if (recommendations.length < 5) {
      recommendations.push({
        id: `rec-hydration-${priority}`,
        icon: '💧',
        title: '충분한 수분 섭취',
        description: '하루 8잔(약 2리터)의 물을 마시세요. 아침에 일어나자마자 물 한 잔으로 시작하고, 식사 전후에도 물을 마시는 습관을 들이세요.',
        category: 'hydration',
        priority: priority++,
      });
    }

    // 5. 영양 추천 (기본 추천)
    if (recommendations.length < 5) {
      recommendations.push({
        id: `rec-nutrition-${priority}`,
        icon: '🥗',
        title: '균형 잡힌 식단',
        description: '다양한 색깔의 채소와 과일을 섭취하세요. 가공식품과 당분 섭취를 줄이고, 통곡물과 단백질을 충분히 섭취하세요.',
        category: 'nutrition',
        priority: priority++,
      });
    }

    // 우선순위 순으로 정렬하고 최대 5개만 반환
    return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 5);
  }

  /**
   * 트렌드 분석
   * 
   * 지정된 기간 동안의 건강 지표 트렌드를 분석합니다.
   * 
   * @param userId - 사용자 ID
   * @param period - 분석 기간 (일)
   * @returns 트렌드 데이터 배열
   */
  static async analyzeTrends(userId: string, period: number): Promise<TrendData[]> {
    const trends: TrendData[] = [];

    // 현재 기간과 이전 기간 데이터 조회
    const currentData = await this.fetchHealthData(userId, period);
    const previousData = await this.fetchHealthData(userId, period * 2);
    const previousPeriodData = this.filterDataByDateRange(previousData, period * 2, period);

    // 1. 혈압 트렌드
    const bpTrend = this.analyzeBPTrend(currentData, previousPeriodData, period);
    if (bpTrend) trends.push(bpTrend);

    // 2. 심박수 트렌드
    const hrTrend = this.analyzeHRTrend(currentData, previousPeriodData, period);
    if (hrTrend) trends.push(hrTrend);

    // 3. 수면 트렌드
    const sleepTrend = this.analyzeSleepTrend(currentData, previousPeriodData, period);
    if (sleepTrend) trends.push(sleepTrend);

    // 4. 운동 트렌드
    const exerciseTrend = this.analyzeExerciseTrend(currentData, previousPeriodData, period);
    if (exerciseTrend) trends.push(exerciseTrend);

    // 5. 스트레스 트렌드
    const stressTrend = this.analyzeStressTrend(currentData, previousPeriodData, period);
    if (stressTrend) trends.push(stressTrend);

    // 6. 수분 섭취 트렌드 (기본값)
    trends.push({
      metric: 'hydration',
      label: '수분 섭취',
      currentValue: '데이터 없음',
      previousValue: '데이터 없음',
      change: 0,
      changeDirection: 'stable',
      isImproving: true,
      dataPoints: [],
    });

    return trends;
  }

  /**
   * 혈압 트렌드 분석
   */
  private static analyzeBPTrend(currentData: HealthData, previousData: HealthData, period: number): TrendData | null {
    const currentBP = currentData.vitalSigns.filter(
      vs => vs.bloodPressureSystolic !== null && vs.bloodPressureDiastolic !== null
    );
    const previousBP = previousData.vitalSigns.filter(
      vs => vs.bloodPressureSystolic !== null && vs.bloodPressureDiastolic !== null
    );

    if (currentBP.length === 0) return null;

    const currentAvgSys = currentBP.reduce((sum, vs) => sum + (vs.bloodPressureSystolic || 0), 0) / currentBP.length;
    const currentAvgDia = currentBP.reduce((sum, vs) => sum + (vs.bloodPressureDiastolic || 0), 0) / currentBP.length;
    
    const previousAvgSys = previousBP.length > 0
      ? previousBP.reduce((sum, vs) => sum + (vs.bloodPressureSystolic || 0), 0) / previousBP.length
      : currentAvgSys;
    const previousAvgDia = previousBP.length > 0
      ? previousBP.reduce((sum, vs) => sum + (vs.bloodPressureDiastolic || 0), 0) / previousBP.length
      : currentAvgDia;

    const currentAvg = (currentAvgSys + currentAvgDia) / 2;
    const previousAvg = (previousAvgSys + previousAvgDia) / 2;
    const change = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

    let changeDirection: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) > 2) {
      changeDirection = change > 0 ? 'up' : 'down';
    }

    // 혈압은 낮아지는 것이 개선 (단, 너무 낮으면 안됨)
    const isImproving = currentAvg < previousAvg && currentAvgSys >= 90 && currentAvgDia >= 60;

    // 데이터 포인트 생성
    const dataPoints = currentBP.slice(-10).map(vs => ({
      date: new Date(vs.recordedAt).toISOString().split('T')[0],
      value: ((vs.bloodPressureSystolic || 0) + (vs.bloodPressureDiastolic || 0)) / 2,
    }));

    return {
      metric: 'blood_pressure',
      label: '혈압',
      currentValue: `${Math.round(currentAvgSys)}/${Math.round(currentAvgDia)} mmHg`,
      previousValue: `${Math.round(previousAvgSys)}/${Math.round(previousAvgDia)} mmHg`,
      change: Math.round(change * 10) / 10,
      changeDirection,
      isImproving,
      dataPoints,
    };
  }

  /**
   * 심박수 트렌드 분석
   */
  private static analyzeHRTrend(currentData: HealthData, previousData: HealthData, period: number): TrendData | null {
    const currentHR = currentData.vitalSigns.filter(vs => vs.heartRate !== null);
    const previousHR = previousData.vitalSigns.filter(vs => vs.heartRate !== null);

    if (currentHR.length === 0) return null;

    const currentAvg = currentHR.reduce((sum, vs) => sum + (vs.heartRate || 0), 0) / currentHR.length;
    const previousAvg = previousHR.length > 0
      ? previousHR.reduce((sum, vs) => sum + (vs.heartRate || 0), 0) / previousHR.length
      : currentAvg;

    const change = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

    let changeDirection: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) > 2) {
      changeDirection = change > 0 ? 'up' : 'down';
    }

    // 심박수는 60-80 범위에 가까워지는 것이 개선
    const isImproving = Math.abs(currentAvg - 70) < Math.abs(previousAvg - 70);

    const dataPoints = currentHR.slice(-10).map(vs => ({
      date: new Date(vs.recordedAt).toISOString().split('T')[0],
      value: vs.heartRate || 0,
    }));

    return {
      metric: 'heart_rate',
      label: '심박수',
      currentValue: `${Math.round(currentAvg)} bpm`,
      previousValue: `${Math.round(previousAvg)} bpm`,
      change: Math.round(change * 10) / 10,
      changeDirection,
      isImproving,
      dataPoints,
    };
  }

  /**
   * 수면 트렌드 분석
   */
  private static analyzeSleepTrend(currentData: HealthData, previousData: HealthData, period: number): TrendData | null {
    if (currentData.sleepData.length === 0) return null;

    const currentAvg = currentData.sleepData.reduce((sum, sleep) => sum + sleep.duration, 0) / currentData.sleepData.length;
    const previousAvg = previousData.sleepData.length > 0
      ? previousData.sleepData.reduce((sum, sleep) => sum + sleep.duration, 0) / previousData.sleepData.length
      : currentAvg;

    const change = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

    let changeDirection: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) > 5) {
      changeDirection = change > 0 ? 'up' : 'down';
    }

    // 수면은 7-9시간에 가까워지는 것이 개선
    const isImproving = Math.abs(currentAvg - 8) < Math.abs(previousAvg - 8);

    const dataPoints = currentData.sleepData.slice(-10).map(sleep => ({
      date: new Date(sleep.date).toISOString().split('T')[0],
      value: sleep.duration,
    }));

    return {
      metric: 'sleep',
      label: '수면 시간',
      currentValue: `${currentAvg.toFixed(1)} 시간`,
      previousValue: `${previousAvg.toFixed(1)} 시간`,
      change: Math.round(change * 10) / 10,
      changeDirection,
      isImproving,
      dataPoints,
    };
  }

  /**
   * 운동 트렌드 분석
   */
  private static analyzeExerciseTrend(currentData: HealthData, previousData: HealthData, period: number): TrendData | null {
    if (currentData.exerciseData.length === 0) return null;

    const currentTotal = currentData.exerciseData.reduce((sum, ex) => sum + ex.duration, 0);
    const previousTotal = previousData.exerciseData.reduce((sum, ex) => sum + ex.duration, 0);

    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    let changeDirection: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) > 10) {
      changeDirection = change > 0 ? 'up' : 'down';
    }

    // 운동은 증가하는 것이 개선
    const isImproving = currentTotal > previousTotal;

    // 일별 운동 시간 집계
    const dailyExercise = new Map<string, number>();
    currentData.exerciseData.forEach(ex => {
      const date = new Date(ex.date).toISOString().split('T')[0];
      dailyExercise.set(date, (dailyExercise.get(date) || 0) + ex.duration);
    });

    const dataPoints = Array.from(dailyExercise.entries())
      .slice(-10)
      .map(([date, value]) => ({ date, value }));

    return {
      metric: 'exercise',
      label: '운동 시간',
      currentValue: `${Math.round(currentTotal)} 분`,
      previousValue: `${Math.round(previousTotal)} 분`,
      change: Math.round(change * 10) / 10,
      changeDirection,
      isImproving,
      dataPoints,
    };
  }

  /**
   * 스트레스 트렌드 분석
   */
  private static analyzeStressTrend(currentData: HealthData, previousData: HealthData, period: number): TrendData | null {
    if (currentData.stressData.length === 0) return null;

    const currentAvg = currentData.stressData.reduce((sum, stress) => sum + stress.level, 0) / currentData.stressData.length;
    const previousAvg = previousData.stressData.length > 0
      ? previousData.stressData.reduce((sum, stress) => sum + stress.level, 0) / previousData.stressData.length
      : currentAvg;

    const change = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

    let changeDirection: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) > 10) {
      changeDirection = change > 0 ? 'up' : 'down';
    }

    // 스트레스는 감소하는 것이 개선
    const isImproving = currentAvg < previousAvg;

    const dataPoints = currentData.stressData.slice(-10).map(stress => ({
      date: new Date(stress.date).toISOString().split('T')[0],
      value: stress.level,
    }));

    return {
      metric: 'stress',
      label: '스트레스 지수',
      currentValue: `${currentAvg.toFixed(1)}/10`,
      previousValue: `${previousAvg.toFixed(1)}/10`,
      change: Math.round(change * 10) / 10,
      changeDirection,
      isImproving,
      dataPoints,
    };
  }

  /**
   * 빠른 통계 계산
   * 
   * 선택된 기간의 주요 건강 지표 평균값을 계산합니다.
   * 
   * @param userId - 사용자 ID
   * @param period - 분석 기간 (일)
   * @returns 빠른 통계
   */
  private static async getQuickStats(userId: string, period: number): Promise<QuickStats> {
    const healthData = await this.fetchHealthData(userId, period);

    // 1. 혈압 평균
    const bpReadings = healthData.vitalSigns.filter(
      vs => vs.bloodPressureSystolic !== null && vs.bloodPressureDiastolic !== null
    );
    
    let bloodPressureValue: string;
    if (bpReadings.length > 0) {
      const avgSystolic = Math.round(
        bpReadings.reduce((sum, vs) => sum + (vs.bloodPressureSystolic || 0), 0) / bpReadings.length
      );
      const avgDiastolic = Math.round(
        bpReadings.reduce((sum, vs) => sum + (vs.bloodPressureDiastolic || 0), 0) / bpReadings.length
      );
      bloodPressureValue = `${avgSystolic}/${avgDiastolic}`;
    } else {
      bloodPressureValue = '데이터 없음';
    }

    // 2. 심박수 평균
    const hrReadings = healthData.vitalSigns.filter(vs => vs.heartRate !== null);
    let heartRateValue: number;
    if (hrReadings.length > 0) {
      heartRateValue = Math.round(
        hrReadings.reduce((sum, vs) => sum + (vs.heartRate || 0), 0) / hrReadings.length
      );
    } else {
      heartRateValue = 0;
    }

    // 3. 수면 평균
    let sleepValue: number;
    if (healthData.sleepData.length > 0) {
      sleepValue = Math.round(
        (healthData.sleepData.reduce((sum, sleep) => sum + sleep.duration, 0) / healthData.sleepData.length) * 10
      ) / 10;
    } else {
      sleepValue = 0;
    }

    // 4. 주간 운동 시간
    let exerciseValue: number;
    if (healthData.exerciseData.length > 0) {
      const totalMinutes = healthData.exerciseData.reduce((sum, ex) => sum + ex.duration, 0);
      const dates = healthData.exerciseData.map(ex => new Date(ex.date).getTime());
      const daysCovered = dates.length > 0 
        ? (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24) + 1
        : 7;
      exerciseValue = Math.round((totalMinutes / daysCovered) * 7);
    } else {
      exerciseValue = 0;
    }

    return {
      bloodPressure: {
        value: bloodPressureValue,
        unit: 'mmHg',
      },
      heartRate: {
        value: heartRateValue,
        unit: 'bpm',
      },
      sleep: {
        value: sleepValue,
        unit: '시간',
      },
      exercise: {
        value: exerciseValue,
        unit: '분/주',
      },
    };
  }

  /**
   * 캐시 히트율 로깅
   * 
   * @param isHit - 캐시 히트 여부
   */
  private static logCacheHitRate(isHit: boolean): void {
    if (isHit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }

    const totalRequests = this.cacheHits + this.cacheMisses;
    
    // 100번 요청마다 캐시 히트율 로깅
    if (totalRequests % 100 === 0) {
      const hitRate = (this.cacheHits / totalRequests) * 100;
      console.log(`[AI Insights] 📊 캐시 히트율: ${hitRate.toFixed(2)}% (히트: ${this.cacheHits}, 미스: ${this.cacheMisses}, 총: ${totalRequests})`);
    }
  }

  /**
   * 성능 메트릭 로깅
   * 
   * @param metrics - 성능 메트릭
   */
  private static logPerformanceMetrics(metrics: {
    userId: string;
    totalDuration: number;
    dataFetchDuration: number;
    processingDuration: number;
    cacheSaveDuration: number;
    dataPointsCount: number;
  }): void {
    const {
      userId,
      totalDuration,
      dataFetchDuration,
      processingDuration,
      cacheSaveDuration,
      dataPointsCount,
    } = metrics;

    // 성능 경고 (총 처리 시간이 5초 이상인 경우)
    if (totalDuration > 5000) {
      console.warn(`[AI Insights] ⚠️  성능 경고: 인사이트 생성이 느립니다 (${totalDuration}ms)`);
    }

    // 상세 성능 메트릭 로깅
    console.log(`[AI Insights] 📈 성능 메트릭:`, {
      userId,
      totalDuration: `${totalDuration}ms`,
      dataFetchDuration: `${dataFetchDuration}ms (${((dataFetchDuration / totalDuration) * 100).toFixed(1)}%)`,
      processingDuration: `${processingDuration}ms (${((processingDuration / totalDuration) * 100).toFixed(1)}%)`,
      cacheSaveDuration: `${cacheSaveDuration}ms (${((cacheSaveDuration / totalDuration) * 100).toFixed(1)}%)`,
      dataPointsCount,
      avgTimePerDataPoint: `${(totalDuration / dataPointsCount).toFixed(2)}ms`,
    });
  }

  /**
   * 캐시 통계 조회
   * 
   * @returns 캐시 통계
   */
  static getCacheStats(): { hits: number; misses: number; hitRate: number; total: number } {
    const total = this.cacheHits + this.cacheMisses;
    const hitRate = total > 0 ? (this.cacheHits / total) * 100 : 0;

    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      total,
    };
  }

  /**
   * 캐시 통계 초기화
   */
  static resetCacheStats(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
    console.log('[AI Insights] 🔄 캐시 통계 초기화됨');
  }
}
