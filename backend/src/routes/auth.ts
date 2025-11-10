import express from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  refreshAuthToken,
  validateToken,
  changePassword,
  socialLogin, // 추가
  requestPasswordReset, // 추가
  resetPassword, // 추가
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRegistration, validateLogin } from '../middleware/validation';

const router = express.Router();

// 공개 라우트 (인증 불필요)
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshAuthToken);
router.post('/social-login', socialLogin); // 추가
router.post('/request-password-reset', requestPasswordReset); // 추가
router.post('/reset-password', resetPassword); // 추가

// 보호된 라우트 (인증 필요)
router.use(authenticateToken);

router.post('/logout', logout);
router.get('/profile', getProfile);
router.post('/validate', validateToken);
router.post('/change-password', changePassword);

export default router;
