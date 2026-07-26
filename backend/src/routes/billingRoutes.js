import { Router } from 'express';
import * as ctrl from '../controllers/billingController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'admin', 'receptionist', 'patient'), ctrl.list);
router.get('/:id', authorize('super_admin', 'admin', 'receptionist', 'patient'), ctrl.getById);
router.post('/', authorize('super_admin', 'admin', 'receptionist'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin', 'receptionist'), ctrl.update);
router.post('/:id/payment', authorize('super_admin', 'admin', 'receptionist'), ctrl.recordPayment);

export default router;
