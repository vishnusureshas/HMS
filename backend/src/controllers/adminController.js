import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User, Patient, Doctor, Appointment, Billing } from '../models/index.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../services/cacheService.js';

const CACHE_KEY = 'admin:dashboard';
const CACHE_TTL = 300;

export async function getDashboard(req, res, next) {
  try {
    const cached = await cacheGet(CACHE_KEY);
    if (cached) {
      return res.json({ success: true, stats: cached });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      revenueResult,
    ] = await Promise.all([
      Patient.count(),
      Doctor.count({ include: [{ model: User, where: { isActive: true }, required: true }] }),
      Appointment.count({
        where: {
          appointmentDate: { [Op.between]: [todayStart, todayEnd] },
        },
      }),
      Billing.findAll({
        attributes: [
          [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total')), 0), 'totalRevenue'],
        ],
        where: { paymentStatus: 'paid' },
        raw: true,
      }),
    ]);

    const stats = {
      totalPatients,
      totalDoctors,
      todayAppointments,
      revenue: parseFloat(revenueResult[0]?.totalRevenue || 0),
    };

    await cacheSet(CACHE_KEY, stats, CACHE_TTL);

    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
}

export async function invalidateDashboardCache(req, res, next) {
  try {
    await cacheDelPattern('admin:*');
    res.json({ success: true, message: 'Dashboard cache cleared' });
  } catch (err) {
    next(err);
  }
}
