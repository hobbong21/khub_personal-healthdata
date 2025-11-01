import { api } from './api';

// 검사 결과 관련 타입 정의 (요구사항 8.1, 8.2)
export type TestCategory = 'blood' | 'urine' | 'imaging' | 'endoscopy' | 'biopsy' | 'cardiac' | 'pulmonary' | 'other';
export type BloodTestSubcategory = 'cbc' | 'liver_function' | 'kidney_function' | 'lipid_panel' | 'glucose' | 'thyroid' | 'cardiac_markers' | 'tumor_markers' | 'hormones' | 'vitamins' | 'electrolytes' | 'coagulation' | 'immunology' | 'other';
export type TestResultStatus = 'normal' | 'abnormal' | 'critical' | 'borderline' | 'pending';

export interface TestItem {
  name: string;
  value: number | string;
  unit?: string;
  referenceRange: {
    min?: number;
    max?: number;
    text?: string;
  };
  status: TestResultStatus;
  flags?: string[];
}

export interface CreateTestResultRequest {
  testCategory: TestCategory;
  testSubcategory?: BloodTestSubcategory;
  testName: string;
  testItems: TestItem[];
  overallStatus?: TestResultStatus;
  testDate: string;
  laboratoryName?: string;
  doctorNotes?: string;
  imageFiles?: string[];
}

export interface TestResultResponse {
  id: string;
  medicalRecordId: string;
  testCategory: TestCategory;
  testSubcategory?: BloodTestSubcategory;
  testName: string;
  testItems: TestItem[];
  overallStatus: TestResultStatus;
  testDate: Date;
  laboratoryName?: string;
  doctorNotes?: string;
  imageFiles?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TestResultFilters {
  testCategory?: TestCategory;
  testSubcategory?: BloodTestSubcategory;
  testName?: string;
  status?: TestResultStatus;
  startDate?: string;
  endDate?: string;
  laboratoryName?: string;
  abnormalOnly?: boolean;
}

export interface TestResultListResponse {
  testResults: TestResultResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: TestResultFilters;
  summary: {
    totalTests: number;
    normalCount: number;
    abnormalCount: number;
    criticalCount: number;
    categoryCounts: Record<TestCategory, number>;
  };
}

export interface TestResultTrend {
  testName: string;
  testCategory: TestCategory;
  unit?: string;
  dataPoints: Array<{
    date: Date;
    value: number;
    status: TestResultStatus;
    referenceRange: {
      min?: number;
      max?: number;
    };
  }>;
  trend: 'improving' | 'worsening' | 'stable' | 'fluctuating';
  changePercentage?: number;
  lastYearComparison?: {
    currentValue: number;
    previousValue: number;
    changePercentage: number;
    isSignificant: boolean;
  };
}

export interface TestResultComparison {
  testName: string;
  current: {
    value: number | string;
    date: Date;
    status: TestResultStatus;
  };
  previous?: {
    value: number | string;
    date: Date;
    status: TestResultStatus;
  };
  change?: {
    absolute: number;
    percentage: number;
    direction: 'increased' | 'decreased' | 'unchanged';
    isSignificant: boolean;
  };
  referenceRange: {
    min?: number;
    max?: number;
    text?: string;
  };
}

export interface TestResultStats {
  totalTests: number;
  testsByCategory: Record<TestCategory, number>;
  testsByStatus: Record<TestResultStatus, number>;
  recentAbnormalResults: TestResultResponse[];
  trendingTests: TestResultTrend[];
  upcomingTests: Array<{
    testName: string;
    scheduledDate: Date;
    frequency: string;
    lastTestDate?: Date;
  }>;
}

export class TestResultApi {
  /**
   * 검사 결과 생성 (요구사항 8.1, 8.2)
   */
  static async createTestResult(recordId: string, data: CreateTestResultRequest): Promise<TestResultResponse> {
    const response = await api.post(`/medical/records/${recordId}/test-results`, data);
    return response.data.data;
  }

  /**
   * 검사 결과 조회 (요구사항 8.1, 8.2)
   */
  static async getTestResult(id: string): Promise<TestResultResponse> {
    const response = await api.get(`/medical/test-results/${id}`);
    return response.data.data;
  }

  /**
   * 검사 결과 목록 조회 (요구사항 8.1, 8.2, 8.4)
   */
  static async getTestResults(
    filters: TestResultFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<TestResultListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    const response = await api.get(`/medical/test-results?${params}`);
    return response.data.data;
  }

  /**
   * 검사 결과 트렌드 분석 (요구사항 8.4, 8.5)
   */
  static async getTestResultTrends(testNames: string[]): Promise<TestResultTrend[]> {
    const params = new URLSearchParams({
      testNames: testNames.join(',')
    });

    const response = await api.get(`/medical/test-results/trends?${params}`);
    return response.data.data;
  }

  /**
   * 검사 결과 비교 (요구사항 8.5)
   */
  static async compareTestResults(testName: string): Promise<TestResultComparison> {
    const response = await api.get(`/medical/test-results/compare/${encodeURIComponent(testName)}`);
    return response.data.data;
  }

  /**
   * 검사 결과 통계 (요구사항 8.2, 8.4)
   */
  static async getTestResultStats(): Promise<TestResultStats> {
    const response = await api.get('/medical/test-results/stats');
    return response.data.data;
  }

  /**
   * 비정상 검사 결과 조회 (요구사항 8.2)
   */
  static async getAbnormalTestResults(page: number = 1, limit: number = 20): Promise<TestResultListResponse> {
    const response = await api.get(`/medical/test-results/abnormal?page=${page}&limit=${limit}`);
    return response.data.data;
  }

  /**
   * 검사 결과 해석 (요구사항 8.2)
   */
  static async getTestResultInterpretation(id: string): Promise<{
    interpretation: string[];
    summary: {
      totalItems: number;
      normalCount: number;
      abnormalCount: number;
      criticalCount: number;
      keyFindings: string[];
    };
    testResult: TestResultResponse;
  }> {
    const response = await api.get(`/medical/test-results/${id}/interpretation`);
    return response.data.data;
  }

  /**
   * 카테고리별 검사 결과 조회 (요구사항 8.1)
   */
  static async getTestResultsByCategory(
    category: TestCategory,
    page: number = 1,
    limit: number = 20
  ): Promise<TestResultListResponse> {
    const response = await api.get(`/medical/test-results/category/${category}?page=${page}&limit=${limit}`);
    return response.data.data;
  }
}