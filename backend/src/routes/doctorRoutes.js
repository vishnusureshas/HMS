import { Router } from 'express';
import * as ctrl from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, authorize('admin'), ctrl.create);
router.put('/:id', authenticate, authorize('admin'), ctrl.update);
router.delete('/:id', authenticate, authorize('admin'), ctrl.remove);

export default router;
