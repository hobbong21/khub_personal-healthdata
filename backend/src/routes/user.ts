import express from 'express';
import {
  updateProfile,
  calculateBMI,
  getProfileCompleteness,
  deleteAccount,
  updateLifestyleHabits,
  updateBasicInfo,
  updatePhysicalInfo,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { validateProfileUpdate } from '../middleware/validation';

const router = express.Router();

// 모든 사용자 프로필 라우트는 인증이 필요
router.use(authenticateToken);

// 프로필 관리 라우트
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/profile/basic', updateBasicInfo);
router.put('/profile/physical', updatePhysicalInfo);
router.put('/profile/lifestyle', updateLifestyleHabits);

// BMI 계산
router.post('/bmi/calculate', calculateBMI);

// 프로필 완성도 조회
router.get('/profile/completeness', getProfileCompleteness);

// 계정 관리
router.delete('/account', deleteAccount);

export default router;