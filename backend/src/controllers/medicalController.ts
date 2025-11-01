import { Request, Response } from 'express';
import { MedicalService } from '../services/medicalService';
import { CreateMedicalRecordRequest, UpdateMedicalRecordRequest, MedicalRecordFilters, CreateTestResultRequest, TestResultFilters } from '../types/medical';
import { TestResultModel } from '../models/TestResult';
import { TestResultAnalysis } from '../utils/testResultAnalysis';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class MedicalController {
  /**
   * 진료 기록 생성 (요구사항 5.1, 5.2)
   * POST /api/medical/records
   */
  static async createMedicalRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const recordData: CreateMedicalRecordRequest = req.body;

      const medicalRecord = await MedicalService.createMedicalRecord(userId, recordData);

      res.status(201).json({
        success: true,
        message: '진료 기록이 성공적으로 생성되었습니다',
        data: medicalRecord
      });
    } catch (error) {
      console.error('진료 기록 생성 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '진료 기록 생성에 실패했습니다'
      });
    }
  }

  /**
   * 진료 기록 조회 (요구사항 5.1, 5.2)
   * GET /api/medical/records/:id
   */
  static async getMedicalRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const medicalRecord = await MedicalService.getMedicalRecord(id, userId);

      res.json({
        success: true,
        data: medicalRecord
      });
    } catch (error) {
      console.error('진료 기록 조회 오류:', error);
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : '진료 기록을 찾을 수 없습니다'
      });
    }
  }

  /**
   * 진료 기록 목록 조회 (요구사항 5.2, 5.4, 5.5)
   * GET /api/medical/records
   */
  static async getMedicalRecords(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const {
        page = '1',
        limit = '10',
        department,
        startDate,
        endDate,
        hospitalName,
        doctorName,
        diagnosisCode,
        searchTerm
      } = req.query;

      const filters: MedicalRecordFilters = {
        ...(department && { department: department as string }),
        ...(startDate && { startDate: startDate as string }),
        ...(endDate && { endDate: endDate as string }),
        ...(hospitalName && { hospitalName: hospitalName as string }),
        ...(doctorName && { doctorName: doctorName as string }),
        ...(diagnosisCode && { diagnosisCode: diagnosisCode as string }),
        ...(searchTerm && { searchTerm: searchTerm as string })
      };

      const result = await MedicalService.getMedicalRecords(
        userId,
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('진료 기록 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '진료 기록 목록 조회에 실패했습니다'
      });
    }
  }

  /**
   * 진료 기록 업데이트 (요구사항 5.2)
   * PUT /api/medical/records/:id
   */
  static async updateMedicalRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      const updateData: UpdateMedicalRecordRequest = req.body;

      const updatedRecord = await MedicalService.updateMedicalRecord(id, userId, updateData);

      res.json({
        success: true,
        message: '진료 기록이 성공적으로 업데이트되었습니다',
        data: updatedRecord
      });
    } catch (error) {
      console.error('진료 기록 업데이트 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '진료 기록 업데이트에 실패했습니다'
      });
    }
  }

  /**
   * 진료 기록 삭제 (요구사항 5.2)
   * DELETE /api/medical/records/:id
   */
  static async deleteMedicalRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      await MedicalService.deleteMedicalRecord(id, userId);

      res.json({
        success: true,
        message: '진료 기록이 성공적으로 삭제되었습니다'
      });
    } catch (error) {
      console.error('진료 기록 삭제 오류:', error);
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : '진료 기록을 찾을 수 없습니다'
      });
    }
  }

  /**
   * 진료 기록 통계 조회 (요구사항 5.5)
   * GET /api/medical/stats
   */
  static async getMedicalRecordStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      const stats = await MedicalService.getMedicalRecordStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('진료 기록 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '진료 기록 통계 조회에 실패했습니다'
      });
    }
  }

  /**
   * 진료 기록 타임라인 조회 (요구사항 5.1)
   * GET /api/medical/timeline
   */
  static async getMedicalRecordTimeline(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      const timeline = await MedicalService.getMedicalRecordTimeline(userId);

      res.json({
        success: true,
        data: timeline
      });
    } catch (error) {
      console.error('진료 기록 타임라인 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '진료 기록 타임라인 조회에 실패했습니다'
      });
    }
  }

  /**
   * 진료 기록 검색 (요구사항 5.4)
   * GET /api/medical/search
   */
  static async searchMedicalRecords(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { q: searchTerm } = req.query;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: '검색어를 입력해주세요'
        });
        return;
      }

      const searchResult = await MedicalService.searchMedicalRecords(userId, searchTerm as string);

      res.json({
        success: true,
        data: searchResult
      });
    } catch (error) {
      console.error('진료 기록 검색 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '진료 기록 검색에 실패했습니다'
      });
    }
  }

  /**
   * ICD-10 코드 검색 (요구사항 5.2)
   * GET /api/medical/icd10/search
   */
  static async searchICD10Codes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { q: searchTerm } = req.query;

      if (!searchTerm) {
        res.json({
          success: true,
          data: []
        });
        return;
      }

      const codes = await MedicalService.searchICD10Codes(searchTerm as string);

      res.json({
        success: true,
        data: codes
      });
    } catch (error) {
      console.error('ICD-10 코드 검색 오류:', error);
      res.status(500).json({
        success: false,
        message: 'ICD-10 코드 검색에 실패했습니다'
      });
    }
  }

  /**
   * 진료과별 통계 조회 (요구사항 5.4, 5.5)
   * GET /api/medical/stats/departments
   */
  static async getDepartmentStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      const departmentStats = await MedicalService.getDepartmentStats(userId);

      res.json({
        success: true,
        data: departmentStats
      });
    } catch (error) {
      console.error('진료과별 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '진료과별 통계 조회에 실패했습니다'
      });
    }
  }

  /**
   * 월별 진료 통계 조회 (요구사항 5.5)
   * GET /api/medical/stats/monthly
   */
  static async getMonthlyStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { year = new Date().getFullYear().toString() } = req.query;

      const monthlyStats = await MedicalService.getMonthlyStats(userId, parseInt(year as string));

      res.json({
        success: true,
        data: monthlyStats
      });
    } catch (error) {
      console.error('월별 진료 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '월별 진료 통계 조회에 실패했습니다'
      });
    }
  }

  /**
   * 최근 진료 기록 조회 (요구사항 5.5)
   * GET /api/medical/recent
   */
  static async getRecentMedicalRecords(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { limit = '5' } = req.query;

      const recentRecords = await MedicalService.getRecentMedicalRecords(userId, parseInt(limit as string));

      res.json({
        success: true,
        data: recentRecords
      });
    } catch (error) {
      console.error('최근 진료 기록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '최근 진료 기록 조회에 실패했습니다'
      });
    }
  }

  /**
   * 특정 병원의 진료 기록 조회 (요구사항 5.4)
   * GET /api/medical/hospitals/:hospitalName/records
   */
  static async getMedicalRecordsByHospital(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { hospitalName } = req.params;
      const { page = '1', limit = '10' } = req.query;

      const result = await MedicalService.getMedicalRecordsByHospital(
        userId,
        decodeURIComponent(hospitalName),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('병원별 진료 기록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '병원별 진료 기록 조회에 실패했습니다'
      });
    }
  }

  /**
   * 특정 진료과의 진료 기록 조회 (요구사항 5.4)
   * GET /api/medical/departments/:department/records
   */
  static async getMedicalRecordsByDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { department } = req.params;
      const { page = '1', limit = '10' } = req.query;

      const result = await MedicalService.getMedicalRecordsByDepartment(
        userId,
        decodeURIComponent(department),
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('진료과별 진료 기록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '진료과별 진료 기록 조회에 실패했습니다'
      });
    }
  }

  /**
   * 날짜 범위별 진료 기록 조회 (요구사항 5.4)
   * GET /api/medical/records/date-range
   */
  static async getMedicalRecordsByDateRange(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { startDate, endDate, page = '1', limit = '10' } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: '시작 날짜와 종료 날짜를 모두 입력해주세요'
        });
        return;
      }

      const result = await MedicalService.getMedicalRecordsByDateRange(
        userId,
        startDate as string,
        endDate as string,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('날짜 범위별 진료 기록 조회 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '날짜 범위별 진료 기록 조회에 실패했습니다'
      });
    }
  }

  // ===== 검사 결과 관리 API (요구사항 8.1, 8.2, 8.4, 8.5) =====

  /**
   * 검사 결과 생성 (요구사항 8.1, 8.2)
   * POST /api/medical/records/:recordId/test-results
   */
  static async createTestResult(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { recordId } = req.params;
      const testResultData: CreateTestResultRequest = req.body;

      // 진료 기록이 해당 사용자의 것인지 확인
      const medicalRecord = await MedicalService.getMedicalRecord(recordId, userId);
      if (!medicalRecord) {
        res.status(404).json({
          success: false,
          message: '진료 기록을 찾을 수 없습니다'
        });
        return;
      }

      // 검사 항목 분석 및 상태 결정
      const analyzedItems = await TestResultAnalysis.analyzeTestItems(
        testResultData.testItems,
        testResultData.testName,
        testResultData.testCategory,
        // TODO: 사용자 나이와 성별 정보 가져오기
      );

      const overallStatus = TestResultAnalysis.determineOverallStatus(analyzedItems);

      const enhancedTestResultData = {
        ...testResultData,
        testItems: analyzedItems,
        overallStatus
      };

      const testResult = await TestResultModel.create(recordId, enhancedTestResultData);

      res.status(201).json({
        success: true,
        message: '검사 결과가 성공적으로 등록되었습니다',
        data: testResult
      });
    } catch (error) {
      console.error('검사 결과 생성 오류:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : '검사 결과 등록에 실패했습니다'
      });
    }
  }

  /**
   * 검사 결과 조회 (요구사항 8.1, 8.2)
   * GET /api/medical/test-results/:id
   */
  static async getTestResult(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const testResult = await TestResultModel.findById(id);
      if (!testResult) {
        res.status(404).json({
          success: false,
          message: '검사 결과를 찾을 수 없습니다'
        });
        return;
      }

      res.json({
        success: true,
        data: testResult
      });
    } catch (error) {
      console.error('검사 결과 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '검사 결과 조회에 실패했습니다'
      });
    }
  }

  /**
   * 사용자별 검사 결과 목록 조회 (요구사항 8.1, 8.2, 8.4)
   * GET /api/medical/test-results
   */
  static async getTestResults(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const {
        page = '1',
        limit = '20',
        testCategory,
        testSubcategory,
        testName,
        status,
        startDate,
        endDate,
        laboratoryName,
        abnormalOnly
      } = req.query;

      const filters: TestResultFilters = {
        ...(testCategory && { testCategory: testCategory as any }),
        ...(testSubcategory && { testSubcategory: testSubcategory as any }),
        ...(testName && { testName: testName as string }),
        ...(status && { status: status as any }),
        ...(startDate && { startDate: startDate as string }),
        ...(endDate && { endDate: endDate as string }),
        ...(laboratoryName && { laboratoryName: laboratoryName as string }),
        ...(abnormalOnly === 'true' && { abnormalOnly: true })
      };

      const result = await TestResultModel.findByUserId(
        userId,
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('검사 결과 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '검사 결과 목록 조회에 실패했습니다'
      });
    }
  }

  /**
   * 검사 결과 트렌드 분석 (요구사항 8.4, 8.5)
   * GET /api/medical/test-results/trends
   */
  static async getTestResultTrends(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { testNames } = req.query;

      if (!testNames) {
        res.status(400).json({
          success: false,
          message: '분석할 검사 항목을 지정해주세요'
        });
        return;
      }

      const testNameArray = Array.isArray(testNames) 
        ? testNames as string[]
        : (testNames as string).split(',');

      const trends = await TestResultModel.getTrends(userId, testNameArray);

      res.json({
        success: true,
        data: trends
      });
    } catch (error) {
      console.error('검사 결과 트렌드 분석 오류:', error);
      res.status(500).json({
        success: false,
        message: '검사 결과 트렌드 분석에 실패했습니다'
      });
    }
  }

  /**
   * 검사 결과 비교 (요구사항 8.5)
   * GET /api/medical/test-results/compare/:testName
   */
  static async compareTestResults(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { testName } = req.params;

      const comparison = await TestResultModel.compareResults(userId, decodeURIComponent(testName));

      if (!comparison) {
        res.status(404).json({
          success: false,
          message: '비교할 검사 결과가 없습니다'
        });
        return;
      }

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      console.error('검사 결과 비교 오류:', error);
      res.status(500).json({
        success: false,
        message: '검사 결과 비교에 실패했습니다'
      });
    }
  }

  /**
   * 검사 결과 통계 (요구사항 8.2, 8.4)
   * GET /api/medical/test-results/stats
   */
  static async getTestResultStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;

      const stats = await TestResultModel.getStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('검사 결과 통계 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '검사 결과 통계 조회에 실패했습니다'
      });
    }
  }

  /**
   * 비정상 검사 결과 조회 (요구사항 8.2)
   * GET /api/medical/test-results/abnormal
   */
  static async getAbnormalTestResults(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { page = '1', limit = '20' } = req.query;

      const filters: TestResultFilters = {
        abnormalOnly: true
      };

      const result = await TestResultModel.findByUserId(
        userId,
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('비정상 검사 결과 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '비정상 검사 결과 조회에 실패했습니다'
      });
    }
  }

  /**
   * 검사 결과 해석 (요구사항 8.2)
   * GET /api/medical/test-results/:id/interpretation
   */
  static async getTestResultInterpretation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const testResult = await TestResultModel.findById(id);
      if (!testResult) {
        res.status(404).json({
          success: false,
          message: '검사 결과를 찾을 수 없습니다'
        });
        return;
      }

      const interpretation = TestResultAnalysis.generateInterpretation(
        testResult.testItems,
        testResult.testCategory
      );

      const summary = TestResultAnalysis.generateSummary(testResult.testItems);

      res.json({
        success: true,
        data: {
          interpretation,
          summary,
          testResult
        }
      });
    } catch (error) {
      console.error('검사 결과 해석 오류:', error);
      res.status(500).json({
        success: false,
        message: '검사 결과 해석에 실패했습니다'
      });
    }
  }

  /**
   * 카테고리별 검사 결과 조회 (요구사항 8.1)
   * GET /api/medical/test-results/category/:category
   */
  static async getTestResultsByCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId!;
      const { category } = req.params;
      const { page = '1', limit = '20' } = req.query;

      const filters: TestResultFilters = {
        testCategory: category as any
      };

      const result = await TestResultModel.findByUserId(
        userId,
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('카테고리별 검사 결과 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '카테고리별 검사 결과 조회에 실패했습니다'
      });
    }
  }
}