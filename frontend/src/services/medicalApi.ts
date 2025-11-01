import { api } from './api';

// Medical record types (요구사항 5.1, 5.2)
export interface MedicalRecord {
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
  testResults: TestResult[];
  prescriptions: Prescription[];
}

export interface TestResult {
  id: string;
  medicalRecordId: string;
  testType: string;
  testName: string;
  results: Record<string, any>;
  referenceRange?: string;
  status?: string;
  testDate: Date;
}

export interface Prescription {
  id: string;
  medicalRecordId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

export interface CreateMedicalRecordRequest {
  hospitalName: string;
  department: string;
  doctorName: string;
  diagnosisCode?: string;
  diagnosisDescription?: string;
  doctorNotes?: string;
  cost?: number;
  visitDate: string;
  testResults?: CreateTestResultRequest[];
  prescriptions?: CreatePrescriptionRequest[];
}

export interface CreateTestResultRequest {
  testType: string;
  testName: string;
  results: Record<string, any>;
  referenceRange?: string;
  status?: 'normal' | 'abnormal' | 'critical' | 'pending';
  testDate: string;
}

export interface CreatePrescriptionRequest {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

export interface MedicalRecordFilters {
  department?: string;
  startDate?: string;
  endDate?: string;
  hospitalName?: string;
  doctorName?: string;
  diagnosisCode?: string;
  searchTerm?: string;
}

export interface MedicalRecordListResponse {
  records: MedicalRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: MedicalRecordFilters;
}

export interface MedicalRecordStats {
  totalRecords: number;
  totalCost: number;
  departmentStats: Array<{
    department: string;
    count: number;
    totalCost: number;
  }>;
  recentVisits: MedicalRecord[];
  upcomingAppointments: Array<{
    id: string;
    hospitalName: string;
    department: string;
    doctorName: string;
    appointmentDate: Date;
    status: 'scheduled' | 'confirmed' | 'cancelled';
  }>;
}

export interface MedicalRecordTimelineItem {
  id: string;
  type: 'visit' | 'test' | 'prescription' | 'appointment';
  date: Date;
  title: string;
  description: string;
  hospitalName?: string;
  department?: string;
  doctorName?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export interface ICD10Code {
  code: string;
  description: string;
  category: string;
}

export class MedicalApi {
  /**
   * 진료 기록 생성 (요구사항 5.1, 5.2)
   */
  static async createMedicalRecord(data: CreateMedicalRecordRequest): Promise<MedicalRecord> {
    const response = await api.post('/medical/records', data);
    return response.data.data;
  }

  /**
   * 진료 기록 조회 (요구사항 5.1, 5.2)
   */
  static async getMedicalRecord(id: string): Promise<MedicalRecord> {
    const response = await api.get(`/medical/records/${id}`);
    return response.data.data;
  }

  /**
   * 진료 기록 목록 조회 (요구사항 5.2, 5.4, 5.5)
   */
  static async getMedicalRecords(
    filters: MedicalRecordFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<MedicalRecordListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
      )
    });

    const response = await api.get(`/medical/records?${params}`);
    return response.data.data;
  }

  /**
   * 진료 기록 업데이트 (요구사항 5.2)
   */
  static async updateMedicalRecord(id: string, data: Partial<CreateMedicalRecordRequest>): Promise<MedicalRecord> {
    const response = await api.put(`/medical/records/${id}`, data);
    return response.data.data;
  }

  /**
   * 진료 기록 삭제 (요구사항 5.2)
   */
  static async deleteMedicalRecord(id: string): Promise<void> {
    await api.delete(`/medical/records/${id}`);
  }

  /**
   * 진료 기록 통계 조회 (요구사항 5.5)
   */
  static async getMedicalRecordStats(): Promise<MedicalRecordStats> {
    const response = await api.get('/medical/stats');
    return response.data.data;
  }

  /**
   * 진료 기록 타임라인 조회 (요구사항 5.1)
   */
  static async getMedicalRecordTimeline(): Promise<MedicalRecordTimelineItem[]> {
    const response = await api.get('/medical/timeline');
    return response.data.data;
  }

  /**
   * 진료 기록 검색 (요구사항 5.4)
   */
  static async searchMedicalRecords(searchTerm: string): Promise<{
    records: MedicalRecord[];
    testResults: TestResult[];
    prescriptions: Prescription[];
    totalResults: number;
    searchTerm: string;
    suggestions: string[];
  }> {
    const response = await api.get(`/medical/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data.data;
  }

  /**
   * ICD-10 코드 검색 (요구사항 5.2)
   */
  static async searchICD10Codes(searchTerm: string): Promise<ICD10Code[]> {
    const response = await api.get(`/medical/icd10/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data.data;
  }

  /**
   * 진료과별 통계 조회 (요구사항 5.4, 5.5)
   */
  static async getDepartmentStats(): Promise<Array<{
    department: string;
    count: number;
    totalCost: number;
    lastVisit: Date;
  }>> {
    const response = await api.get('/medical/stats/departments');
    return response.data.data;
  }

  /**
   * 월별 진료 통계 조회 (요구사항 5.5)
   */
  static async getMonthlyStats(year: number): Promise<Array<{
    month: number;
    visitCount: number;
    totalCost: number;
    departments: string[];
  }>> {
    const response = await api.get(`/medical/stats/monthly?year=${year}`);
    return response.data.data;
  }

  /**
   * 최근 진료 기록 조회 (요구사항 5.5)
   */
  static async getRecentMedicalRecords(limit: number = 5): Promise<MedicalRecord[]> {
    const response = await api.get(`/medical/recent?limit=${limit}`);
    return response.data.data;
  }

  /**
   * 특정 병원의 진료 기록 조회 (요구사항 5.4)
   */
  static async getMedicalRecordsByHospital(
    hospitalName: string,
    page: number = 1,
    limit: number = 10
  ): Promise<MedicalRecordListResponse> {
    const response = await api.get(
      `/medical/hospitals/${encodeURIComponent(hospitalName)}/records?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  /**
   * 특정 진료과의 진료 기록 조회 (요구사항 5.4)
   */
  static async getMedicalRecordsByDepartment(
    department: string,
    page: number = 1,
    limit: number = 10
  ): Promise<MedicalRecordListResponse> {
    const response = await api.get(
      `/medical/departments/${encodeURIComponent(department)}/records?page=${page}&limit=${limit}`
    );
    return response.data.data;
  }

  /**
   * 날짜 범위별 진료 기록 조회 (요구사항 5.4)
   */
  static async getMedicalRecordsByDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10
  ): Promise<MedicalRecordListResponse> {
    const response = await api.get(
      `/medical/records/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`
    );
    return response.data.data;
  }
}