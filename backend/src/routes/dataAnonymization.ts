import express from 'express';
import { 
    requestDataAnonymization,
    getAnonymizationHistory,
    getAnonymizationStats
 } from '../controllers/dataAnonymizationController';
import { authenticateToken } from '../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

/**
 * 지원되는 익명화 방법 목록 조회
 */
// router.get('/methods', getAnonymizationMethods);

/**
 * 사용자 데이터 익명화 (요구사항 16.1)
 */
router.post(
  '/anonymize',
  [
    body('dataTypes')
      .isArray({ min: 1 })
      .withMessage('최소 하나의 데이터 타입을 선택해주세요'),
    body('dataTypes.*')
      .isIn([
        'vital_signs',
        'health_records',
        'medical_records',
        'medications',
        'test_results',
        'genomic_data',
        'family_history'
      ])
      .withMessage('유효한 데이터 타입을 선택해주세요'),
    body('purpose')
      .notEmpty()
      .withMessage('익명화 목적은 필수입니다'),
    body('anonymizationMethod')
      .optional()
      .isIn(['k_anonymity', 'l_diversity', 't_closeness', 'differential_privacy', 'basic'])
      .withMessage('유효한 익명화 방법을 선택해주세요'),
  ],
  validateRequest,
  requestDataAnonymization
);

/**
 * 익명화 로그 조회 (요구사항 16.1)
 */
router.get(
  '/logs',
  [
    query('purpose')
      .optional()
      .isString()
      .withMessage('목적은 문자열이어야 합니다'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('제한 수는 1-100 사이의 정수여야 합니다'),
  ],
  validateRequest,
  getAnonymizationHistory
);

/**
 * 전체 익명화 통계 조회 (관리자용)
 */
router.get('/stats', getAnonymizationStats);

/**
 * 데이터 품질 평가 (요구사항 16.1)
 */
// router.get(
//   '/quality/:anonymizedUserId',
//   [
//     param('anonymizedUserId')
//       .matches(/^anon_[a-f0-9]{16}$/)
//       .withMessage('유효한 익명화 사용자 ID를 제공해주세요'),
//   ],
//   validateRequest,
//   evaluateDataQuality
// );

/**
 * 익명화 데이터 내보내기
 */
// router.get(
//   '/export/:anonymizedUserId',
//   [
//     param('anonymizedUserId')
//       .matches(/^anon_[a-f0-9]{16}$/)
//       .withMessage('유효한 익명화 사용자 ID를 제공해주세요'),
//     query('format')
//       .optional()
//       .isIn(['json', 'csv', 'download'])
//       .withMessage('유효한 형식을 선택해주세요 (json, csv, download)'),
//   ],
//   validateRequest,
//   exportAnonymizedData
// );

export default router;