import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  getDashboard, invalidateDashboardCache,
  listUsers, updateUserRole, toggleUserActive,
  getAuditLogs, getSettings, updateSettings,
} from '../controllers/adminController.js';

const router = Router();

router.get('/dashboard', authenticate, authorize('super_admin', 'admin', 'doctor', 'receptionist'), getDashboard);
router.post('/cache/clear', authenticate, authorize('super_admin'), invalidateDashboardCache);

router.get('/users', authenticate, authorize('super_admin', 'admin'), listUsers);
router.put('/users/:id/role', authenticate, authorize('super_admin'), updateUserRole);
router.patch('/users/:id/toggle-active', authenticate, authorize('super_admin', 'admin'), toggleUserActive);

router.get('/audit-logs', authenticate, authorize('super_admin'), getAuditLogs);

router.get('/settings', authenticate, authorize('super_admin', 'admin'), getSettings);
router.put('/settings', authenticate, authorize('super_admin'), updateSettings);

export default router;
