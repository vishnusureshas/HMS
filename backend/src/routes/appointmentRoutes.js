import { Router } from 'express';
import * as ctrl from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateAppointment } from '../validators/appointmentValidator.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('super_admin', 'admin', 'receptionist', 'doctor', 'patient'), ctrl.list);
router.get('/:id', authorize('super_admin', 'admin', 'receptionist', 'doctor', 'patient'), ctrl.getById);
router.post('/', authorize('super_admin', 'admin', 'receptionist', 'doctor'), validateAppointment, ctrl.create);
router.put('/:id', authorize('super_admin', 'admin', 'receptionist', 'doctor'), ctrl.update);
router.patch('/:id/status', authorize('super_admin', 'admin', 'receptionist', 'doctor'), ctrl.updateStatus);
router.delete('/:id', authorize('super_admin', 'admin'), ctrl.remove);

export default router;
