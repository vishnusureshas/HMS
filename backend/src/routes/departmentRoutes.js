import { Router } from 'express';
import * as ctrl from '../controllers/departmentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, authorize('super_admin', 'admin'), ctrl.create);
router.put('/:id', authenticate, authorize('super_admin', 'admin'), ctrl.update);
router.delete('/:id', authenticate, authorize('super_admin', 'admin'), ctrl.remove);

export default router;
