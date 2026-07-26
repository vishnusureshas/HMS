import { Router } from 'express';
import upload from '../middlewares/upload.js';
import * as ctrl from '../controllers/uploadController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.post('/single', upload.single('file'), ctrl.uploadFile);
router.post('/multiple', upload.array('files', 10), ctrl.uploadMultiple);
router.post('/medical-record/:recordId', authorize('doctor', 'admin'), upload.single('file'), ctrl.uploadMedicalAttachment);
router.delete('/:key', authorize('admin'), ctrl.deleteFile);

export default router;
