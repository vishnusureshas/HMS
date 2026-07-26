import { Router } from 'express';
import * as ctrl from '../controllers/patientController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'admin', 'receptionist', 'doctor'), ctrl.list);
router.get('/:id', authorize('super_admin', 'admin', 'receptionist', 'doctor', 'patient'), ctrl.getById);
router.post('/', authorize('super_admin', 'admin', 'receptionist'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin', 'receptionist'), ctrl.update);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

export default router;
