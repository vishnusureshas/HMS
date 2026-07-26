import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { getDashboard, invalidateDashboardCache } from '../controllers/adminController.js';

const router = Router();

router.get('/dashboard', authenticate, authorize('super_admin', 'admin', 'doctor', 'receptionist'), getDashboard);
router.post('/cache/clear', authenticate, authorize('super_admin'), invalidateDashboardCache);

export default router;
