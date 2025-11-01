import { MedicalRecordModel } from '../models/MedicalRecord';
import {
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  MedicalRecordResponse,
  MedicalRecordFilters,
  MedicalRecordListResponse,
  MedicalRecordStats,
  MedicalRecordTimelineItem,
  MedicalRecordSearchResult,
  ICD10Code
} from '../types/medical';

export class MedicalService {
  /**
   * 진료 기록 생성 (요구사항 5.1, 5.2)
   */
  static async createMedicalRecord(
    userId: string,
    recordData: CreateMedicalRecordRequest
  ): Promise<MedicalRecordResponse> {
    // 유효성 검사 (요구사항 5.1)
    const validation = MedicalRecordModel.validateMedicalRecord(recordData);
    if (!validation.isValid) {
      throw new Error(`유효성 검사 실패: ${validation.errors.join(', ')}`);
    }

    return await MedicalRecordModel.create(userId, recordData);
  }

  /**
   * 진료 기록 조회 (요구사항 5.1, 5.2)
   */
  static async getMedicalRecord(id: string, userId: string): Promise<MedicalRecordResponse> {
    const record = await MedicalRecordModel.findById(id, userId);
    if (!record) {
      throw new Error('진료 기록을 찾을 수 없습니다');
    }
    return record;
  }

  /**
   * 사용자의 진료 기록 목록 조회 (요구사항 5.2, 5.4, 5.5)
   */
  static async getMedicalRecords(
    userId: string,
    filters: MedicalRecordFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<MedicalRecordListResponse> {
    // 페이지네이션 유효성 검사
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    return await MedicalRecordModel.findByUserId(userId, filters, page, limit);
  }

  /**
   * 진료 기록 업데이트 (요구사항 5.2)
   */
  static async updateMedicalRecord(
    id: string,
    userId: string,
    updateData: UpdateMedicalRecordRequest
  ): Promise<MedicalRecordResponse> {
    // 부분 유효성 검사
    if (updateData.visitDate) {
      const visitDate = new Date(updateData.visitDate);
      if (isNaN(visitDate.getTime())) {
        throw new Error('유효한 진료 날짜를 입력해주세요');
      }
      if (visitDate > new Date()) {
        throw new Error('진료 날짜는 미래일 수 없습니다');
      }
    }

    if (updateData.diagnosisCode) {
      const icd10Regex = /^[A-Z]\d{2}(\.\d{1,2})?$/;
      if (!icd10Regex.test(updateData.diagnosisCode)) {
        throw new Error('유효한 ICD-10 코드 형식이 아닙니다 (예: A00, B15.1)');
      }
    }

    if (updateData.cost !== undefined && updateData.cost !== null && updateData.cost < 0) {
      throw new Error('진료비는 0 이상이어야 합니다');
    }

    const updatedRecord = await MedicalRecordModel.update(id, userId, updateData);
    if (!updatedRecord) {
      throw new Error('진료 기록을 찾을 수 없습니다');
    }

    return updatedRecord;
  }

  /**
   * 진료 기록 삭제 (요구사항 5.2)
   */
  static async deleteMedicalRecord(id: string, userId: string): Promise<void> {
    const deleted = await MedicalRecordModel.delete(id, userId);
    if (!deleted) {
      throw new Error('진료 기록을 찾을 수 없습니다');
    }
  }

  /**
   * 진료 기록 통계 조회 (요구사항 5.5)
   */
  static async getMedicalRecordStats(userId: string): Promise<MedicalRecordStats> {
    return await MedicalRecordModel.getStats(userId);
  }

  /**
   * 진료 기록 타임라인 조회 (요구사항 5.1)
   */
  static async getMedicalRecordTimeline(userId: string): Promise<MedicalRecordTimelineItem[]> {
    return await MedicalRecordModel.getTimeline(userId);
  }

  /**
   * 진료 기록 검색 (요구사항 5.4)
   */
  static async searchMedicalRecords(userId: string, searchTerm: string): Promise<MedicalRecordSearchResult> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new Error('검색어를 입력해주세요');
    }

    if (searchTerm.trim().length < 2) {
      throw new Error('검색어는 최소 2자 이상이어야 합니다');
    }

    return await MedicalRecordModel.search(userId, searchTerm.trim());
  }

  /**
   * ICD-10 코드 검색 (요구사항 5.2)
   */
  static async searchICD10Codes(searchTerm: string): Promise<ICD10Code[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    return await MedicalRecordModel.searchICD10Codes(searchTerm.trim());
  }

  /**
   * 진료과별 통계 조회 (요구사항 5.4, 5.5)
   */
  static async getDepartmentStats(userId: string): Promise<Array<{
    department: string;
    count: number;
    totalCost: number;
    lastVisit: Date;
  }>> {
    const stats = await MedicalRecordModel.getStats(userId);
    
    // 각 진료과별 마지막 방문일 추가
    const departmentStatsWithLastVisit = await Promise.all(
      stats.departmentStats.map(async (stat) => {
        const lastRecord = await MedicalRecordModel.findByUserId(
          userId,
          { department: stat.department },
          1,
          1
        );
        
        return {
          ...stat,
          lastVisit: lastRecord.records[0]?.visitDate || new Date(0)
        };
      })
    );

    return departmentStatsWithLastVisit.sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());
  }

  /**
   * 월별 진료 통계 조회 (요구사항 5.5)
   */
  static async getMonthlyStats(userId: string, year: number): Promise<Array<{
    month: number;
    visitCount: number;
    totalCost: number;
    departments: string[];
  }>> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const records = await MedicalRecordModel.findByUserId(
      userId,
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      1,
      1000 // 충분히 큰 수로 모든 기록 가져오기
    );

    const monthlyStats = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      visitCount: 0,
      totalCost: 0,
      departments: [] as string[]
    }));

    records.records.forEach(record => {
      const month = record.visitDate.getMonth();
      monthlyStats[month].visitCount++;
      monthlyStats[month].totalCost += record.cost || 0;
      
      if (!monthlyStats[month].departments.includes(record.department)) {
        monthlyStats[month].departments.push(record.department);
      }
    });

    return monthlyStats;
  }

  /**
   * 최근 진료 기록 조회 (요구사항 5.5)
   */
  static async getRecentMedicalRecords(userId: string, limit: number = 5): Promise<MedicalRecordResponse[]> {
    const result = await MedicalRecordModel.findByUserId(userId, {}, 1, limit);
    return result.records;
  }

  /**
   * 특정 병원의 진료 기록 조회 (요구사항 5.4)
   */
  static async getMedicalRecordsByHospital(
    userId: string,
    hospitalName: string,
    page: number = 1,
    limit: number = 10
  ): Promise<MedicalRecordListResponse> {
    return await MedicalRecordModel.findByUserId(
      userId,
      { hospitalName },
      page,
      limit
    );
  }

  /**
   * 특정 진료과의 진료 기록 조회 (요구사항 5.4)
   */
  static async getMedicalRecordsByDepartment(
    userId: string,
    department: string,
    page: number = 1,
    limit: number = 10
  ): Promise<MedicalRecordListResponse> {
    return await MedicalRecordModel.findByUserId(
      userId,
      { department },
      page,
      limit
    );
  }

  /**
   * 날짜 범위별 진료 기록 조회 (요구사항 5.4)
   */
  static async getMedicalRecordsByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10
  ): Promise<MedicalRecordListResponse> {
    // 날짜 유효성 검사
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('유효한 날짜 형식을 입력해주세요');
    }

    if (start > end) {
      throw new Error('시작 날짜는 종료 날짜보다 이전이어야 합니다');
    }

    return await MedicalRecordModel.findByUserId(
      userId,
      { startDate, endDate },
      page,
      limit
    );
  }
}