import { Appointment, Patient, Doctor, User, MedicalRecord, Billing, AuditLog } from '../models/index.js';
import { Op } from 'sequelize';

export const list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const where = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (patient) where.patientId = patient.id;
    }
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (doctor) where.doctorId = doctor.id;
    }
    if (req.query.status) where.status = req.query.status;
    if (req.query.patientId) where.patientId = req.query.patientId;
    if (req.query.doctorId) where.doctorId = req.query.doctorId;
    if (req.query.date) {
      where.appointmentDate = {
        [Op.between]: [
          new Date(`${req.query.date}T00:00:00.000Z`),
          new Date(`${req.query.date}T23:59:59.999Z`),
        ],
      };
    }

    const { rows, count } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: Patient, include: [{ model: User, attributes: ['id', 'email'] }] },
        { model: Doctor, include: [{ model: User, attributes: ['id', 'email'] }] },
      ],
      offset,
      limit,
      order: [['appointmentDate', 'DESC']],
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page, limit, pages: Math.ceil(count / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Patient, include: [{ model: User, attributes: ['id', 'email'] }] },
        { model: Doctor, include: [{ model: User, attributes: ['id', 'email'] }] },
        { model: MedicalRecord },
      ],
    });

    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== appointment.patientId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== appointment.doctorId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentDate, type, notes } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(400).json({ success: false, error: 'Patient not found' });

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(400).json({ success: false, error: 'Doctor not found' });

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      type: type || 'in_person',
      notes,
      createdBy: req.user.id,
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'Appointment',
      entityId: appointment.id,
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });

    await appointment.update(req.body);

    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'Appointment',
      entityId: appointment.id,
    });

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });

    appointment.status = status;
    await appointment.save();

    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE_STATUS',
      entity: 'Appointment',
      entityId: appointment.id,
    });

    if (status === 'completed') {
      await MedicalRecord.findOrCreate({
        where: { appointmentId: appointment.id },
        defaults: {
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentId: appointment.id,
        },
      });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });

    await appointment.destroy();

    await AuditLog.create({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'Appointment',
      entityId: appointment.id,
    });

    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (err) {
    next(err);
  }
};
