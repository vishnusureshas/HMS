import { Router } from 'express';
import * as ctrl from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';

const router = Router();

router.post('/register', validateRegister, ctrl.register);
router.post('/login', validateLogin, ctrl.login);
router.get('/me', authenticate, ctrl.me);

export default router;
