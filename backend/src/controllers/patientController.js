import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { Patient, User, Appointment, MedicalRecord, Billing } from '../models/index.js';
import logger from '../utils/logger.js';

export const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const where = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) return res.status(404).json({ success: false, error: 'Patient profile not found' });
      where.id = patient.id;
    }

    if (req.query.search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${req.query.search}%` } },
        { lastName: { [Op.iLike]: `%${req.query.search}%` } },
        { phone: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }

    const { rows, count } = await Patient.findAndCountAll({
      where,
      include: [{ model: User, attributes: ['id', 'email', 'role', 'isActive'] }],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
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
    const patient = await Patient.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'email', 'role', 'isActive'] },
        { model: Appointment },
        { model: MedicalRecord },
        { model: Billing },
      ],
    });

    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

    if (req.user.role === 'patient') {
      const own = await Patient.findOne({ where: { userId: req.user.id } });
      if (!own || own.id !== patient.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { userId, firstName, lastName, dateOfBirth, gender, phone, address, bloodGroup } = req.body;

    let targetUserId = userId;

    if (!targetUserId) {
      const patientEmail = req.body.email || `patient_${Date.now()}@hospital.com`;
      const patientPassword = req.body.password || 'patient123';
      const hash = await bcrypt.hash(patientPassword, 12);
      const user = await User.create({ email: patientEmail, password: hash, role: 'patient', isActive: true });
      targetUserId = user.id;
    } else {
      const user = await User.findByPk(targetUserId);
      if (!user) return res.status(400).json({ success: false, error: 'User not found' });

      const existing = await Patient.findOne({ where: { userId: targetUserId } });
      if (existing) return res.status(400).json({ success: false, error: 'Patient profile already exists for this user' });
    }

    const patient = await Patient.create({
      userId: targetUserId, firstName, lastName, dateOfBirth, gender, phone, address, bloodGroup,
    });

    res.status(201).json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

    if (req.user.role === 'patient') {
      const own = await Patient.findOne({ where: { userId: req.user.id } });
      if (!own || own.id !== patient.id) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    await patient.update(req.body);
    res.json({ success: true, data: patient });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

    await patient.destroy();
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (err) {
    next(err);
  }
};
