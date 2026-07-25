import { Router } from 'express';
import { sequelize } from '../config/database.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const dbStatus = await sequelize.authenticate()
    .then(() => 'healthy')
    .catch(() => 'unhealthy');

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    db: dbStatus,
    timestamp: new Date(),
  });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

export default router;
