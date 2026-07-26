import { Router } from 'express';
import * as ctrl from '../controllers/prescriptionController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/patient/:patientId', ctrl.getByPatientId);
router.post('/', authorize('doctor', 'admin'), ctrl.create);
router.put('/:id', authorize('doctor', 'admin'), ctrl.update);

export default router;
