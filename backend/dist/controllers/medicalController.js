"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalController = void 0;
const medicalService_1 = require("../services/medicalService");
const TestResult_1 = require("../models/TestResult");
const testResultAnalysis_1 = require("../utils/testResultAnalysis");
class MedicalController {
    static async createMedicalRecord(req, res) {
        try {
            const userId = req.userId;
            const recordData = req.body;
            const medicalRecord = await medicalService_1.MedicalService.createMedicalRecord(userId, recordData);
            res.status(201).json({
                success: true,
                message: '진료 기록이 성공적으로 생성되었습니다',
                data: medicalRecord
            });
        }
        catch (error) {
            console.error('진료 기록 생성 오류:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : '진료 기록 생성에 실패했습니다'
            });
        }
    }
    static async getMedicalRecord(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const medicalRecord = await medicalService_1.MedicalService.getMedicalRecord(id, userId);
            res.json({
                success: true,
                data: medicalRecord
            });
        }
        catch (error) {
            console.error('진료 기록 조회 오류:', error);
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : '진료 기록을 찾을 수 없습니다'
            });
        }
    }
    static async getMedicalRecords(req, res) {
        try {
            const userId = req.userId;
            const { page = '1', limit = '10', department, startDate, endDate, hospitalName, doctorName, diagnosisCode, searchTerm } = req.query;
            const filters = {
                ...(department && { department: department }),
                ...(startDate && { startDate: startDate }),
                ...(endDate && { endDate: endDate }),
                ...(hospitalName && { hospitalName: hospitalName }),
                ...(doctorName && { doctorName: doctorName }),
                ...(diagnosisCode && { diagnosisCode: diagnosisCode }),
                ...(searchTerm && { searchTerm: searchTerm })
            };
            const result = await medicalService_1.MedicalService.getMedicalRecords(userId, filters, parseInt(page), parseInt(limit));
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('진료 기록 목록 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '진료 기록 목록 조회에 실패했습니다'
            });
        }
    }
    static async updateMedicalRecord(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            const updateData = req.body;
            const updatedRecord = await medicalService_1.MedicalService.updateMedicalRecord(id, userId, updateData);
            res.json({
                success: true,
                message: '진료 기록이 성공적으로 업데이트되었습니다',
                data: updatedRecord
            });
        }
        catch (error) {
            console.error('진료 기록 업데이트 오류:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : '진료 기록 업데이트에 실패했습니다'
            });
        }
    }
    static async deleteMedicalRecord(req, res) {
        try {
            const userId = req.userId;
            const { id } = req.params;
            await medicalService_1.MedicalService.deleteMedicalRecord(id, userId);
            res.json({
                success: true,
                message: '진료 기록이 성공적으로 삭제되었습니다'
            });
        }
        catch (error) {
            console.error('진료 기록 삭제 오류:', error);
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : '진료 기록을 찾을 수 없습니다'
            });
        }
    }
    static async getMedicalRecordStats(req, res) {
        try {
            const userId = req.userId;
            const stats = await medicalService_1.MedicalService.getMedicalRecordStats(userId);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('진료 기록 통계 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '진료 기록 통계 조회에 실패했습니다'
            });
        }
    }
    static async getMedicalRecordTimeline(req, res) {
        try {
            const userId = req.userId;
            const timeline = await medicalService_1.MedicalService.getMedicalRecordTimeline(userId);
            res.json({
                success: true,
                data: timeline
            });
        }
        catch (error) {
            console.error('진료 기록 타임라인 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '진료 기록 타임라인 조회에 실패했습니다'
            });
        }
    }
    static async searchMedicalRecords(req, res) {
        try {
            const userId = req.userId;
            const { q: searchTerm } = req.query;
            if (!searchTerm) {
                res.status(400).json({
                    success: false,
                    message: '검색어를 입력해주세요'
                });
                return;
            }
            const searchResult = await medicalService_1.MedicalService.searchMedicalRecords(userId, searchTerm);
            res.json({
                success: true,
                data: searchResult
            });
        }
        catch (error) {
            console.error('진료 기록 검색 오류:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : '진료 기록 검색에 실패했습니다'
            });
        }
    }
    static async searchICD10Codes(req, res) {
        try {
            const { q: searchTerm } = req.query;
            if (!searchTerm) {
                res.json({
                    success: true,
                    data: []
                });
                return;
            }
            const codes = await medicalService_1.MedicalService.searchICD10Codes(searchTerm);
            res.json({
                success: true,
                data: codes
            });
        }
        catch (error) {
            console.error('ICD-10 코드 검색 오류:', error);
            res.status(500).json({
                success: false,
                message: 'ICD-10 코드 검색에 실패했습니다'
            });
        }
    }
    static async getDepartmentStats(req, res) {
        try {
            const userId = req.userId;
            const departmentStats = await medicalService_1.MedicalService.getDepartmentStats(userId);
            res.json({
                success: true,
                data: departmentStats
            });
        }
        catch (error) {
            console.error('진료과별 통계 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '진료과별 통계 조회에 실패했습니다'
            });
        }
    }
    static async getMonthlyStats(req, res) {
        try {
            const userId = req.userId;
            const { year = new Date().getFullYear().toString() } = req.query;
            const monthlyStats = await medicalService_1.MedicalService.getMonthlyStats(userId, parseInt(year));
            res.json({
                success: true,
                data: monthlyStats
            });
        }
        catch (error) {
            console.error('월별 진료 통계 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '월별 진료 통계 조회에 실패했습니다'
            });
        }
    }
    static async getRecentMedicalRecords(req, res) {
        try {
            const userId = req.userId;
            const { limit = '5' } = req.query;
            const recentRecords = await medicalService_1.MedicalService.getRecentMedicalRecords(userId, parseInt(limit));
            res.json({
                success: true,
                data: recentRecords
            });
        }
        catch (error) {
            console.error('최근 진료 기록 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '최근 진료 기록 조회에 실패했습니다'
            });
        }
    }
    static async getMedicalRecordsByHospital(req, res) {
        try {
            const userId = req.userId;
            const { hospitalName } = req.params;
            const { page = '1', limit = '10' } = req.query;
            const result = await medicalService_1.MedicalService.getMedicalRecordsByHospital(userId, decodeURIComponent(hospitalName), parseInt(page), parseInt(limit));
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('병원별 진료 기록 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '병원별 진료 기록 조회에 실패했습니다'
            });
        }
    }
    static async getMedicalRecordsByDepartment(req, res) {
        try {
            const userId = req.userId;
            const { department } = req.params;
            const { page = '1', limit = '10' } = req.query;
            const result = await medicalService_1.MedicalService.getMedicalRecordsByDepartment(userId, decodeURIComponent(department), parseInt(page), parseInt(limit));
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('진료과별 진료 기록 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '진료과별 진료 기록 조회에 실패했습니다'
            });
        }
    }
    static async getMedicalRecordsByDateRange(req, res) {
        try {
            const userId = req.userId;
            const { startDate, endDate, page = '1', limit = '10' } = req.query;
            if (!startDate || !endDate) {
                res.status(400).json({
                    success: false,
                    message: '시작 날짜와 종료 날짜를 모두 입력해주세요'
                });
                return;
            }
            const result = await medicalService_1.MedicalService.getMedicalRecordsByDateRange(userId, startDate, endDate, parseInt(page), parseInt(limit));
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('날짜 범위별 진료 기록 조회 오류:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : '날짜 범위별 진료 기록 조회에 실패했습니다'
            });
        }
    }
    static async createTestResult(req, res) {
        try {
            const userId = req.userId;
            const { recordId } = req.params;
            const testResultData = req.body;
            const medicalRecord = await medicalService_1.MedicalService.getMedicalRecord(recordId, userId);
            if (!medicalRecord) {
                res.status(404).json({
                    success: false,
                    message: '진료 기록을 찾을 수 없습니다'
                });
                return;
            }
            const analyzedItems = await testResultAnalysis_1.TestResultAnalysis.analyzeTestItems(testResultData.testItems, testResultData.testName, testResultData.testCategory);
            const overallStatus = testResultAnalysis_1.TestResultAnalysis.determineOverallStatus(analyzedItems);
            const enhancedTestResultData = {
                ...testResultData,
                testItems: analyzedItems,
                overallStatus
            };
            const testResult = await TestResult_1.TestResultModel.create(recordId, enhancedTestResultData);
            res.status(201).json({
                success: true,
                message: '검사 결과가 성공적으로 등록되었습니다',
                data: testResult
            });
        }
        catch (error) {
            console.error('검사 결과 생성 오류:', error);
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : '검사 결과 등록에 실패했습니다'
            });
        }
    }
    static async getTestResult(req, res) {
        try {
            const { id } = req.params;
            const testResult = await TestResult_1.TestResultModel.findById(id);
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
        }
        catch (error) {
            console.error('검사 결과 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '검사 결과 조회에 실패했습니다'
            });
        }
    }
    static async getTestResults(req, res) {
        try {
            const userId = req.userId;
            const { page = '1', limit = '20', testCategory, testSubcategory, testName, status, startDate, endDate, laboratoryName, abnormalOnly } = req.query;
            const filters = {
                ...(testCategory && { testCategory: testCategory }),
                ...(testSubcategory && { testSubcategory: testSubcategory }),
                ...(testName && { testName: testName }),
                ...(status && { status: status }),
                ...(startDate && { startDate: startDate }),
                ...(endDate && { endDate: endDate }),
                ...(laboratoryName && { laboratoryName: laboratoryName }),
                ...(abnormalOnly === 'true' && { abnormalOnly: true })
            };
            const result = await TestResult_1.TestResultModel.findByUserId(userId, filters, parseInt(page), parseInt(limit));
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('검사 결과 목록 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '검사 결과 목록 조회에 실패했습니다'
            });
        }
    }
    static async getTestResultTrends(req, res) {
        try {
            const userId = req.userId;
            const { testNames } = req.query;
            if (!testNames) {
                res.status(400).json({
                    success: false,
                    message: '분석할 검사 항목을 지정해주세요'
                });
                return;
            }
            const testNameArray = Array.isArray(testNames)
                ? testNames
                : testNames.split(',');
            const trends = await TestResult_1.TestResultModel.getTrends(userId, testNameArray);
            res.json({
                success: true,
                data: trends
            });
        }
        catch (error) {
            console.error('검사 결과 트렌드 분석 오류:', error);
            res.status(500).json({
                success: false,
                message: '검사 결과 트렌드 분석에 실패했습니다'
            });
        }
    }
    static async compareTestResults(req, res) {
        try {
            const userId = req.userId;
            const { testName } = req.params;
            const comparison = await TestResult_1.TestResultModel.compareResults(userId, decodeURIComponent(testName));
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
        }
        catch (error) {
            console.error('검사 결과 비교 오류:', error);
            res.status(500).json({
                success: false,
                message: '검사 결과 비교에 실패했습니다'
            });
        }
    }
    static async getTestResultStats(req, res) {
        try {
            const userId = req.userId;
            const stats = await TestResult_1.TestResultModel.getStats(userId);
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('검사 결과 통계 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '검사 결과 통계 조회에 실패했습니다'
            });
        }
    }
    static async getAbnormalTestResults(req, res) {
        try {
            const userId = req.userId;
            const { page = '1', limit = '20' } = req.query;
            const filters = {
                abnormalOnly: true
            };
            const result = await TestResult_1.TestResultModel.findByUserId(userId, filters, parseInt(page), parseInt(limit));
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('비정상 검사 결과 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '비정상 검사 결과 조회에 실패했습니다'
            });
        }
    }
    static async getTestResultInterpretation(req, res) {
        try {
            const { id } = req.params;
            const testResult = await TestResult_1.TestResultModel.findById(id);
            if (!testResult) {
                res.status(404).json({
                    success: false,
                    message: '검사 결과를 찾을 수 없습니다'
                });
                return;
            }
            const interpretation = testResultAnalysis_1.TestResultAnalysis.generateInterpretation(testResult.testItems, testResult.testCategory);
            const summary = testResultAnalysis_1.TestResultAnalysis.generateSummary(testResult.testItems);
            res.json({
                success: true,
                data: {
                    interpretation,
                    summary,
                    testResult
                }
            });
        }
        catch (error) {
            console.error('검사 결과 해석 오류:', error);
            res.status(500).json({
                success: false,
                message: '검사 결과 해석에 실패했습니다'
            });
        }
    }
    static async getTestResultsByCategory(req, res) {
        try {
            const userId = req.userId;
            const { category } = req.params;
            const { page = '1', limit = '20' } = req.query;
            const filters = {
                testCategory: category
            };
            const result = await TestResult_1.TestResultModel.findByUserId(userId, filters, parseInt(page), parseInt(limit));
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('카테고리별 검사 결과 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '카테고리별 검사 결과 조회에 실패했습니다'
            });
        }
    }
}
exports.MedicalController = MedicalController;
//# sourceMappingURL=medicalController.js.map