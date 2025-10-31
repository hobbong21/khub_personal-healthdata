import express from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  refreshAuthToken,
  validateToken,
  changePassword,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRegistration, validateLogin } from '../middleware/validation';

const router = express.Router();

// 공개 라우트 (인증 불필요)
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshAuthToken);

// 보호된 라우트 (인증 필요)
router.use(authenticateToken);

router.post('/logout', logout);
router.get('/profile', getProfile);
router.post('/validate', validateToken);
router.post('/change-password', changePassword);

export default router;