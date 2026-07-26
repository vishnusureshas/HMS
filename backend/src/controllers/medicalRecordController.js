import { MedicalRecord, Patient, Doctor, Appointment, User } from '../models/index.js';
import { AuditLog } from '../models/index.js';

export const getByPatientId = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });

    if (req.user.role === 'patient') {
      const own = await Patient.findOne({ where: { userId: req.user.id } });
      if (!own || own.id !== patientId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    const records = await MedicalRecord.findAll({
      where: { patientId },
      include: [
        { model: Patient, include: [{ model: User, attributes: ['id', 'email'] }] },
        { model: Doctor, include: [{ model: User, attributes: ['id', 'email'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { patientId, appointmentId, diagnosis, symptoms, notes } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(400).json({ success: false, error: 'Patient not found' });

    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only doctors can create medical records' });
    }

    const record = await MedicalRecord.create({
      patientId,
      doctorId: doctor ? doctor.id : req.body.doctorId,
      appointmentId: appointmentId || null,
      diagnosis,
      symptoms,
      notes,
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'MedicalRecord',
      entityId: record.id,
    });

    res.status(201).json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findByPk(req.params.id);
    if (!record) return res.status(404).json({ success: false, error: 'Medical record not found' });

    await record.update(req.body);

    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'MedicalRecord',
      entityId: record.id,
    });

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};
