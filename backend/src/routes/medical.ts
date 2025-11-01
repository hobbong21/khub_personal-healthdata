import { Router } from 'express';
import { MedicalController } from '../controllers/medicalController';
import { authenticateToken } from '../middleware/auth';
import { validateMedicalRecord, validateMedicalRecordUpdate, validateTestResult } from '../middleware/validation';

const router = Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 진료 기록 CRUD (요구사항 5.1, 5.2)
router.post('/records', validateMedicalRecord, MedicalController.createMedicalRecord);
router.get('/records/:id', MedicalController.getMedicalRecord);
router.get('/records', MedicalController.getMedicalRecords);
router.put('/records/:id', validateMedicalRecordUpdate, MedicalController.updateMedicalRecord);
router.delete('/records/:id', MedicalController.deleteMedicalRecord);

// 진료 기록 검색 (요구사항 5.4)
router.get('/search', MedicalController.searchMedicalRecords);

// 진료 기록 통계 (요구사항 5.5)
router.get('/stats', MedicalController.getMedicalRecordStats);
router.get('/stats/departments', MedicalController.getDepartmentStats);
router.get('/stats/monthly', MedicalController.getMonthlyStats);

// 진료 기록 타임라인 (요구사항 5.1)
router.get('/timeline', MedicalController.getMedicalRecordTimeline);

// 최근 진료 기록 (요구사항 5.5)
router.get('/recent', MedicalController.getRecentMedicalRecords);

// 병원별/진료과별 진료 기록 (요구사항 5.4)
router.get('/hospitals/:hospitalName/records', MedicalController.getMedicalRecordsByHospital);
router.get('/departments/:department/records', MedicalController.getMedicalRecordsByDepartment);

// 날짜 범위별 진료 기록 (요구사항 5.4)
router.get('/records/date-range', MedicalController.getMedicalRecordsByDateRange);

// ICD-10 코드 검색 (요구사항 5.2)
router.get('/icd10/search', MedicalController.searchICD10Codes);

// ===== 검사 결과 관리 라우트 (요구사항 8.1, 8.2, 8.4, 8.5) =====

// 검사 결과 CRUD
router.post('/records/:recordId/test-results', validateTestResult, MedicalController.createTestResult);
router.get('/test-results/:id', MedicalController.getTestResult);
router.get('/test-results', MedicalController.getTestResults);

// 검사 결과 분석 및 통계
router.get('/test-results/trends', MedicalController.getTestResultTrends);
router.get('/test-results/compare/:testName', MedicalController.compareTestResults);
router.get('/test-results/stats', MedicalController.getTestResultStats);
router.get('/test-results/abnormal', MedicalController.getAbnormalTestResults);
router.get('/test-results/:id/interpretation', MedicalController.getTestResultInterpretation);

// 카테고리별 검사 결과
router.get('/test-results/category/:category', MedicalController.getTestResultsByCategory);

export default router;