import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as ctrl from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from '../validators/authValidator.js';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/register', limiter, validateRegister, ctrl.register);
router.post('/login', limiter, validateLogin, ctrl.login);
router.get('/me', authenticate, ctrl.me);
router.post('/forgot-password', limiter, validateForgotPassword, ctrl.forgotPassword);
router.post('/reset-password', validateResetPassword, ctrl.resetPassword);
router.post('/refresh', ctrl.refreshToken);

export default router;
