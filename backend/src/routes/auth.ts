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

// Public routes (no authentication required)
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshAuthToken);

// The following routes are commented out because their corresponding controller functions are not yet implemented.
// router.post('/social-login', socialLogin); 
// router.post('/request-password-reset', requestPasswordReset); 
// router.post('/reset-password', resetPassword); 

// Protected routes (authentication required)
router.use(authenticateToken);

router.post('/logout', logout);
router.get('/profile', getProfile);
router.post('/validate', validateToken);
router.post('/change-password', changePassword);

export default router;
