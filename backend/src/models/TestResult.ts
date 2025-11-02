import { PrismaClient } from '@prisma/client';
import { 
  CreateTestResultRequest, 
  TestResultResponse, 
  TestResultFilters,
  TestResultListResponse,
  TestResultTrend,
  TestResultComparison,
  TestResultStats,
  TestCategory,
  BloodTestSubcategory,
  TestResultStatus,
  TestItem
} from '../types/medical';

const prisma = new PrismaClient();

export class TestResultModel {
  // 검사 결과 생성 (요구사항 8.1, 8.2)
  static async create(medicalRecordId: string, data: CreateTestResultRequest): Promise<TestResultResponse> {
    const testResult = await prisma.testResult.create({
      data: {
        medicalRecordId,
        testCategory: data.testCategory,
        testSubcategory: data.testSubcategory,
        testName: data.testName,
        testItems: data.testItems,
        overallStatus: data.overallStatus || 'pending',
        testDate: new Date(data.testDate),
        laboratoryName: data.laboratoryName,
        doctorNotes: data.doctorNotes,
        imageFiles: data.imageFiles || []
      },
      include: {
        medicalRecord: true
      }
    });

    return this.formatTestResult(testResult);
  }

  // 검사 결과 조회 (요구사항 8.1, 8.2)
  static async findById(id: string): Promise<TestResultResponse | null> {
    const testResult = await prisma.testResult.findUnique({
      where: { id },
      include: {
        medicalRecord: true
      }
    });

    return testResult ? this.formatTestResult(testResult) : null;
  }

  // 사용자별 검사 결과 목록 조회 (요구사항 8.1, 8.2, 8.4)
  static async findByUserId(
    userId: string, 
    filters: TestResultFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<TestResultListResponse> {
    const where: any = {
      medicalRecord: {
        userId
      }
    };

    // 필터 적용
    if (filters.testCategory) {
      where.testCategory = filters.testCategory;
    }
    if (filters.testSubcategory) {
      where.testSubcategory = filters.testSubcategory;
    }
    if (filters.testName) {
      where.testName = {
        contains: filters.testName,
        mode: 'insensitive'
      };
    }
    if (filters.status) {
      where.overallStatus = filters.status;
    }
    if (filters.startDate || filters.endDate) {
      where.testDate = {};
      if (filters.startDate) {
        where.testDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.testDate.lte = new Date(filters.endDate);
      }
    }
    if (filters.laboratoryName) {
      where.laboratoryName = {
        contains: filters.laboratoryName,
        mode: 'insensitive'
      };
    }
    if (filters.abnormalOnly) {
      where.overallStatus = {
        in: ['abnormal', 'critical', 'borderline']
      };
    }

    const [testResults, total] = await Promise.all([
      prisma.testResult.findMany({
        where,
        include: {
          medicalRecord: true
        },
        orderBy: {
          testDate: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.testResult.count({ where })
    ]);

    // 요약 통계 계산
    const summary = await this.calculateSummary(userId, filters);

    return {
      testResults: testResults.map(this.formatTestResult),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      filters,
      summary
    };
  }

  // 검사 결과 트렌드 분석 (요구사항 8.4, 8.5)
  static async getTrends(userId: string, testNames: string[]): Promise<TestResultTrend[]> {
    const trends: TestResultTrend[] = [];

    for (const testName of testNames) {
      const testResults = await prisma.testResult.findMany({
        where: {
          medicalRecord: { userId },
          testName
        },
        orderBy: {
          testDate: 'asc'
        },
        take: 50 // 최근 50개 결과
      });

      if (testResults.length < 2) continue;

      const dataPoints = testResults.map(result => {
        const testItems = result.testItems as unknown as TestItem[];
        const mainItem = testItems[0]; // 주요 검사 항목
        
        return {
          date: result.testDate,
          value: typeof mainItem.value === 'number' ? mainItem.value : 0,
          status: result.overallStatus as TestResultStatus,
          referenceRange: {
            min: mainItem.referenceRange.min,
            max: mainItem.referenceRange.max
          }
        };
      }).filter(point => typeof point.value === 'number');

      if (dataPoints.length < 2) continue;

      // 트렌드 계산
      const trend = this.calculateTrend(dataPoints);
      const lastYearComparison = this.calculateYearOverYearChange(dataPoints);

      trends.push({
        testName,
        testCategory: testResults[0].testCategory as TestCategory,
        unit: (testResults[0].testItems as unknown as TestItem[])[0]?.unit,
        dataPoints,
        trend,
        changePercentage: lastYearComparison?.changePercentage,
        lastYearComparison
      });
    }

    return trends;
  }

  // 검사 결과 비교 (요구사항 8.5)
  static async compareResults(userId: string, testName: string): Promise<TestResultComparison | null> {
    const results = await prisma.testResult.findMany({
      where: {
        medicalRecord: { userId },
        testName
      },
      orderBy: {
        testDate: 'desc'
      },
      take: 2
    });

    if (results.length === 0) return null;

    const current = results[0];
    const previous = results.length > 1 ? results[1] : null;

    const currentItem = (current.testItems as unknown as TestItem[])[0];
    const previousItem = previous ? (previous.testItems as unknown as TestItem[])[0] : null;

    const comparison: TestResultComparison = {
      testName,
      current: {
        value: currentItem.value,
        date: current.testDate,
        status: current.overallStatus as TestResultStatus
      },
      referenceRange: currentItem.referenceRange
    };

    if (previous && previousItem && typeof currentItem.value === 'number' && typeof previousItem.value === 'number') {
      const absolute = currentItem.value - previousItem.value;
      const percentage = (absolute / previousItem.value) * 100;
      
      comparison.previous = {
        value: previousItem.value,
        date: previous.testDate,
        status: previous.overallStatus as TestResultStatus
      };

      comparison.change = {
        absolute,
        percentage,
        direction: absolute > 0 ? 'increased' : absolute < 0 ? 'decreased' : 'unchanged',
        isSignificant: Math.abs(percentage) > 10 // 10% 이상 변화를 유의미한 변화로 간주
      };
    }

    return comparison;
  }

  // 검사 결과 통계 (요구사항 8.2, 8.4)
  static async getStats(userId: string): Promise<TestResultStats> {
    const [
      totalTests,
      testsByCategory,
      testsByStatus,
      recentAbnormalResults
    ] = await Promise.all([
      prisma.testResult.count({
        where: { medicalRecord: { userId } }
      }),
      this.getTestsByCategory(userId),
      this.getTestsByStatus(userId),
      this.getRecentAbnormalResults(userId)
    ]);

    // 트렌딩 테스트 (자주 실시되는 검사들의 트렌드)
    const commonTests = await this.getCommonTests(userId);
    const trendingTests = await this.getTrends(userId, commonTests);

    return {
      totalTests,
      testsByCategory,
      testsByStatus,
      recentAbnormalResults: recentAbnormalResults.map(this.formatTestResult),
      trendingTests,
      upcomingTests: [] // TODO: 예정된 검사 일정 구현
    };
  }

  // 헬퍼 메서드들
  private static formatTestResult(testResult: any): TestResultResponse {
    return {
      id: testResult.id,
      medicalRecordId: testResult.medicalRecordId,
      testCategory: testResult.testCategory,
      testSubcategory: testResult.testSubcategory,
      testName: testResult.testName,
      testItems: testResult.testItems,
      overallStatus: testResult.overallStatus,
      testDate: testResult.testDate,
      laboratoryName: testResult.laboratoryName,
      doctorNotes: testResult.doctorNotes,
      imageFiles: testResult.imageFiles || [],
      createdAt: testResult.createdAt,
      updatedAt: testResult.updatedAt
    };
  }

  private static async calculateSummary(userId: string, filters: TestResultFilters) {
    const where: any = {
      medicalRecord: { userId }
    };

    // 필터 적용 (동일한 로직)
    if (filters.testCategory) where.testCategory = filters.testCategory;
    if (filters.testSubcategory) where.testSubcategory = filters.testSubcategory;
    if (filters.startDate || filters.endDate) {
      where.testDate = {};
      if (filters.startDate) where.testDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.testDate.lte = new Date(filters.endDate);
    }

    const [total, statusCounts, categoryCounts] = await Promise.all([
      prisma.testResult.count({ where }),
      prisma.testResult.groupBy({
        by: ['overallStatus'],
        where,
        _count: true
      }),
      prisma.testResult.groupBy({
        by: ['testCategory'],
        where,
        _count: true
      })
    ]);

    const statusMap: Record<string, number> = {};
    statusCounts.forEach(item => {
      statusMap[item.overallStatus] = item._count;
    });

    const categoryMap: Record<TestCategory, number> = {} as Record<TestCategory, number>;
    categoryCounts.forEach(item => {
      categoryMap[item.testCategory as TestCategory] = item._count;
    });

    return {
      totalTests: total,
      normalCount: statusMap['normal'] || 0,
      abnormalCount: statusMap['abnormal'] || 0,
      criticalCount: statusMap['critical'] || 0,
      categoryCounts: categoryMap
    };
  }

  private static calculateTrend(dataPoints: Array<{ date: Date; value: number }>): 'improving' | 'worsening' | 'stable' | 'fluctuating' {
    if (dataPoints.length < 3) return 'stable';

    const values = dataPoints.map(p => p.value);
    const n = values.length;
    
    // 선형 회귀를 사용한 트렌드 계산
    const sumX = dataPoints.reduce((sum, _, i) => sum + i, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = dataPoints.reduce((sum, point, i) => sum + i * point.value, 0);
    const sumXX = dataPoints.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // 변동성 계산
    const mean = sumY / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    
    if (coefficientOfVariation > 0.2) return 'fluctuating';
    if (Math.abs(slope) < 0.01) return 'stable';
    return slope > 0 ? 'improving' : 'worsening';
  }

  private static calculateYearOverYearChange(dataPoints: Array<{ date: Date; value: number }>) {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    
    const recent = dataPoints.filter(p => p.date >= oneYearAgo).sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    const yearAgo = dataPoints.filter(p => p.date < oneYearAgo).sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    
    if (!recent || !yearAgo) return undefined;
    
    const changePercentage = ((recent.value - yearAgo.value) / yearAgo.value) * 100;
    
    return {
      currentValue: recent.value,
      previousValue: yearAgo.value,
      changePercentage,
      isSignificant: Math.abs(changePercentage) > 15
    };
  }

  private static async getTestsByCategory(userId: string): Promise<Record<TestCategory, number>> {
    const results = await prisma.testResult.groupBy({
      by: ['testCategory'],
      where: { medicalRecord: { userId } },
      _count: true
    });

    const categoryMap: Record<TestCategory, number> = {} as Record<TestCategory, number>;
    results.forEach(item => {
      categoryMap[item.testCategory as TestCategory] = item._count;
    });

    return categoryMap;
  }

  private static async getTestsByStatus(userId: string): Promise<Record<TestResultStatus, number>> {
    const results = await prisma.testResult.groupBy({
      by: ['overallStatus'],
      where: { medicalRecord: { userId } },
      _count: true
    });

    const statusMap: Record<TestResultStatus, number> = {} as Record<TestResultStatus, number>;
    results.forEach(item => {
      statusMap[item.overallStatus as TestResultStatus] = item._count;
    });

    return statusMap;
  }

  private static async getRecentAbnormalResults(userId: string) {
    return await prisma.testResult.findMany({
      where: {
        medicalRecord: { userId },
        overallStatus: {
          in: ['abnormal', 'critical', 'borderline']
        }
      },
      orderBy: {
        testDate: 'desc'
      },
      take: 10,
      include: {
        medicalRecord: true
      }
    });
  }

  private static async getCommonTests(userId: string): Promise<string[]> {
    const results = await prisma.testResult.groupBy({
      by: ['testName'],
      where: { medicalRecord: { userId } },
      _count: true,
      orderBy: {
        _count: {
          testName: 'desc'
        }
      },
      take: 10
    });

    return results.map(item => item.testName);
  }
}