import { Router } from 'express';
import { sequelize } from '../config/database.js';
import authRoutes from './authRoutes.js';
import patientRoutes from './patientRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import billingRoutes from './billingRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import medicalRecordRoutes from './medicalRecordRoutes.js';
import prescriptionRoutes from './prescriptionRoutes.js';
import adminRoutes from './adminRoutes.js';
import uploadRoutes from './uploadRoutes.js';

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
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/billing', billingRoutes);
router.use('/departments', departmentRoutes);
router.use('/medical-records', medicalRecordRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

export default router;
