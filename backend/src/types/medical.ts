// 진료 기록 관련 타입 정의 (요구사항 5.1, 5.2, 5.3)

// 진료 기록 생성 요청 (요구사항 5.1, 5.2)
export interface CreateMedicalRecordRequest {
  hospitalName: string;
  department: string;
  doctorName: string;
  diagnosisCode?: string; // ICD-10 코드 (요구사항 5.2)
  diagnosisDescription?: string;
  doctorNotes?: string; // 의사 소견 (요구사항 5.3)
  cost?: number; // 진료비 (요구사항 5.3)
  visitDate: string; // ISO 날짜 문자열
  testResults?: CreateTestResultRequest[];
  prescriptions?: CreatePrescriptionRequest[];
}

// 진료 기록 업데이트 요청 (요구사항 5.2)
export interface UpdateMedicalRecordRequest {
  hospitalName?: string;
  department?: string;
  doctorName?: string;
  diagnosisCode?: string;
  diagnosisDescription?: string;
  doctorNotes?: string;
  cost?: number;
  visitDate?: string;
}

// 검사 결과 카테고리 (요구사항 8.1)
export type TestCategory = 'blood' | 'urine' | 'imaging' | 'endoscopy' | 'biopsy' | 'cardiac' | 'pulmonary' | 'other';

// 혈액검사 하위 카테고리 (요구사항 8.1)
export type BloodTestSubcategory = 'cbc' | 'liver_function' | 'kidney_function' | 'lipid_panel' | 'glucose' | 'thyroid' | 'cardiac_markers' | 'tumor_markers' | 'hormones' | 'vitamins' | 'electrolytes' | 'coagulation' | 'immunology' | 'other';

// 검사 결과 상태 (요구사항 8.2)
export type TestResultStatus = 'normal' | 'abnormal' | 'critical' | 'borderline' | 'pending' | 'cancelled';

// 검사 항목 정의 (요구사항 8.2, 8.4)
export interface TestItem {
  name: string;
  value: number | string;
  unit?: string;
  referenceRange: {
    min?: number;
    max?: number;
    text?: string; // 텍스트 형태의 정상 범위 (예: "음성", "양성")
  };
  status: TestResultStatus;
  flags?: string[]; // 특별한 플래그 (예: "H" for High, "L" for Low)
}

// 검사 결과 생성 요청 (요구사항 8.1, 8.2)
export interface CreateTestResultRequest {
  testCategory: TestCategory;
  testSubcategory?: BloodTestSubcategory; // 혈액검사인 경우 하위 카테고리
  testName: string;
  testItems: TestItem[]; // 개별 검사 항목들
  overallStatus?: TestResultStatus; // 전체 검사 결과 상태
  testDate: string;
  laboratoryName?: string; // 검사 기관
  doctorNotes?: string; // 의사 소견
  imageFiles?: string[]; // 영상검사의 경우 이미지 파일 경로
}

// 처방전 생성 요청 (요구사항 5.1)
export interface CreatePrescriptionRequest {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

// 처방전 업데이트 요청 (요구사항 5.1)
export interface UpdatePrescriptionRequest {
  medicationName?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

// 진료 기록 응답 (요구사항 5.1, 5.2)
export interface MedicalRecordResponse {
  id: string;
  userId: string;
  hospitalName: string;
  department: string;
  doctorName: string;
  diagnosisCode?: string;
  diagnosisDescription?: string;
  doctorNotes?: string;
  cost?: number;
  visitDate: Date;
  createdAt: Date;
  testResults: TestResultResponse[];
  prescriptions: PrescriptionResponse[];
}

// 검사 결과 응답 (요구사항 8.1, 8.2)
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

// 처방전 응답 (요구사항 5.1)
export interface PrescriptionResponse {
  id: string;
  medicalRecordId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  instructions: string | null;
}

// 진료 기록 필터링 옵션 (요구사항 5.4, 5.5)
export interface MedicalRecordFilters {
  department?: string; // 진료과별 필터링 (요구사항 5.4)
  startDate?: string; // 날짜별 필터링 (요구사항 5.4)
  endDate?: string;
  hospitalName?: string;
  doctorName?: string;
  diagnosisCode?: string;
  searchTerm?: string; // 검색 기능 (요구사항 5.4)
}

// 진료 기록 목록 응답 (요구사항 5.4, 5.5)
export interface MedicalRecordListResponse {
  records: MedicalRecordResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: MedicalRecordFilters;
}

// 진료 기록 통계 (요구사항 5.5)
export interface MedicalRecordStats {
  totalRecords: number;
  totalCost: number;
  departmentStats: Array<{
    department: string;
    count: number;
    totalCost: number;
  }>;
  recentVisits: MedicalRecordResponse[];
  upcomingAppointments: Array<{
    id: string;
    hospitalName: string;
    department: string;
    doctorName: string;
    appointmentDate: Date;
    status: 'scheduled' | 'confirmed' | 'cancelled';
  }>;
}

// ICD-10 코드 검색 결과 (요구사항 5.2)
export interface ICD10Code {
  code: string;
  description: string;
  category: string;
}

// 진료 기록 유효성 검사 결과 (요구사항 5.1)
export interface MedicalRecordValidationResult {
  isValid: boolean;
  errors: string[];
}

// 진료 기록 타임라인 항목 (요구사항 5.1)
export interface MedicalRecordTimelineItem {
  id: string;
  type: 'visit' | 'test' | 'prescription' | 'appointment';
  date: Date;
  title: string;
  description: string;
  hospitalName?: string;
  department?: string;
  doctorName?: string;
  status?: string | null;
  metadata?: Record<string, any>;
}

// 진료 기록 검색 결과 (요구사항 5.4)
export interface MedicalRecordSearchResult {
  records: MedicalRecordResponse[];
  testResults: TestResultResponse[];
  prescriptions: PrescriptionResponse[];
  totalResults: number;
  searchTerm: string;
  suggestions: string[];
}

// 검사 결과 트렌드 분석 (요구사항 8.4, 8.5)
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
  changePercentage?: number; // 전년도 대비 변화율
  lastYearComparison?: {
    currentValue: number;
    previousValue: number;
    changePercentage: number;
    isSignificant: boolean;
  };
}

// 검사 결과 필터링 옵션 (요구사항 8.1, 8.2)
export interface TestResultFilters {
  testCategory?: TestCategory;
  testSubcategory?: BloodTestSubcategory;
  testName?: string;
  status?: TestResultStatus;
  startDate?: string;
  endDate?: string;
  laboratoryName?: string;
  abnormalOnly?: boolean; // 비정상 결과만 필터링
}

// 검사 결과 목록 응답 (요구사항 8.1, 8.2)
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

// 검사 결과 비교 (요구사항 8.5)
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

// 검사 결과 통계 (요구사항 8.2, 8.4)
export interface TestResultStats {
  totalTests: number;
  testsByCategory: Record<TestCategory, number>;
  testsByStatus: Record<TestResultStatus, number>;
  recentAbnormalResults: TestResultResponse[];
  trendingTests: TestResultTrend[];
  upcomingTests: Array<{
    testName: string;
    scheduledDate: Date;
    frequency: string; // 예: "매년", "6개월마다"
    lastTestDate?: Date;
  }>;
}

// 정상 범위 정의 (요구사항 8.2)
export interface ReferenceRange {
  testName: string;
  testCategory: TestCategory;
  unit?: string;
  ranges: Array<{
    ageMin?: number;
    ageMax?: number;
    gender?: 'male' | 'female' | 'all';
    min?: number;
    max?: number;
    text?: string;
    source?: string; // 참조 기관 (예: "대한진단검사의학회")
  }>;
}

// 검사 결과 유효성 검사 (요구사항 8.1, 8.2)
export interface TestResultValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}