import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { Doctor, User, Department, Appointment } from '../models/index.js';

export const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const where = {};

    if (req.query.search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${req.query.search}%` } },
        { lastName: { [Op.iLike]: `%${req.query.search}%` } },
        { specialization: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.specialization) where.specialization = { [Op.iLike]: `%${req.query.specialization}%` };
    if (req.query.departmentId) where.departmentId = req.query.departmentId;

    if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      where.isActive = true;
    }

    const { rows, count } = await Doctor.findAndCountAll({
      where,
      include: [
        { model: User, attributes: ['id', 'email', 'isActive'] },
        { model: Department, attributes: ['id', 'name'] },
      ],
      offset,
      limit,
      order: [['firstName', 'ASC']],
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
};

export const getById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'email', 'isActive'] },
        { model: Department, attributes: ['id', 'name'] },
        { model: Appointment },
      ],
    });

    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });

    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { userId, departmentId, firstName, lastName, specialization, licenseNumber, consultationFee, availableDays, availableTime } = req.body;

    let targetUserId = userId;

    if (!targetUserId) {
      const doctorEmail = req.body.email || `doctor_${Date.now()}@hospital.com`;
      const doctorPassword = req.body.password || 'doctor123';
      const hash = await bcrypt.hash(doctorPassword, 12);
      const user = await User.create({ email: doctorEmail, password: hash, role: 'doctor', isActive: true });
      targetUserId = user.id;
    } else {
      const user = await User.findByPk(targetUserId);
      if (!user) return res.status(400).json({ success: false, error: 'User not found' });

      const existing = await Doctor.findOne({ where: { userId: targetUserId } });
      if (existing) return res.status(400).json({ success: false, error: 'Doctor profile already exists for this user' });
    }

    if (licenseNumber) {
      const licenseExists = await Doctor.findOne({ where: { licenseNumber } });
      if (licenseExists) return res.status(400).json({ success: false, error: 'License number already in use' });
    }

    const doctor = await Doctor.create({
      userId: targetUserId, departmentId, firstName, lastName, specialization,
      licenseNumber, consultationFee, availableDays, availableTime,
    });

    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });

    if (req.body.licenseNumber && req.body.licenseNumber !== doctor.licenseNumber) {
      const licenseExists = await Doctor.findOne({ where: { licenseNumber: req.body.licenseNumber } });
      if (licenseExists) return res.status(400).json({ success: false, error: 'License number already in use' });
    }

    await doctor.update(req.body);
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, error: 'Doctor not found' });

    await doctor.destroy();
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (err) {
    next(err);
  }
};
