import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User, Patient, Doctor, Appointment, Billing, AuditLog } from '../models/index.js';
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

export async function listUsers(req, res, next) {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        { model: Patient, attributes: ['id', 'firstName', 'lastName'] },
        { model: Doctor, attributes: ['id', 'firstName', 'lastName', 'specialization'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    const validRoles = ['super_admin', 'admin', 'doctor', 'receptionist', 'patient'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE_ROLE',
      entity: 'User',
      entityId: user.id,
      oldValue: { role: oldRole },
      newValue: { role },
    });

    const { password, ...safeUser } = user.toJSON();
    res.json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
}

export async function toggleUserActive(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      userId: req.user.id,
      action: user.isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
      entity: 'User',
      entityId: user.id,
    });

    const { password, ...safeUser } = user.toJSON();
    res.json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const where = {};

    if (req.query.action) where.action = req.query.action;
    if (req.query.userId) where.userId = req.query.userId;

    const { rows, count } = await AuditLog.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'email'], required: false }],
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

let systemSettings = {};

export async function getSettings(req, res, next) {
  try {
    res.json({ success: true, data: systemSettings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    systemSettings = { ...systemSettings, ...req.body };
    res.json({ success: true, data: systemSettings });
  } catch (err) {
    next(err);
  }
}
