import { Router } from 'express';
import * as ctrl from '../controllers/medicalRecordController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/patient/:patientId', authorize('super_admin', 'admin', 'doctor', 'patient'), ctrl.getByPatientId);
router.post('/', authorize('super_admin', 'admin', 'doctor'), ctrl.create);
router.put('/:id', authorize('super_admin', 'admin', 'doctor'), ctrl.update);

export default router;
