import { Router } from 'express';
import * as ctrl from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateAppointment } from '../validators/appointmentValidator.js';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin', 'receptionist', 'doctor'), validateAppointment, ctrl.create);
router.put('/:id', authorize('admin', 'receptionist', 'doctor'), ctrl.update);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id', authorize('admin'), ctrl.remove);

export default router;
