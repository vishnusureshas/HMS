import { Router } from 'express';
import upload from '../middlewares/upload.js';
import * as ctrl from '../controllers/uploadController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.post('/single', authorize('super_admin', 'admin', 'doctor', 'receptionist'), upload.single('file'), ctrl.uploadFile);
router.post('/multiple', authorize('super_admin', 'admin', 'doctor', 'receptionist'), upload.array('files', 10), ctrl.uploadMultiple);
router.post('/medical-record/:recordId', authorize('super_admin', 'admin', 'doctor'), upload.single('file'), ctrl.uploadMedicalAttachment);
router.delete('/:key', authorize('super_admin', 'admin'), ctrl.deleteFile);

export default router;
