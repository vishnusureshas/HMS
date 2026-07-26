import { Prescription, Patient, Doctor, User } from '../models/index.js';

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

    const prescriptions = await Prescription.findAll({
      where: { patientId, isActive: true },
      include: [
        { model: Patient, include: [{ model: User, attributes: ['id', 'email'] }] },
        { model: Doctor, include: [{ model: User, attributes: ['id', 'email'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, data: prescriptions });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { patientId, appointmentId, medicines, instructions } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(400).json({ success: false, error: 'Patient not found' });

    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only doctors can create prescriptions' });
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: doctor ? doctor.id : req.body.doctorId,
      appointmentId: appointmentId || null,
      medicines: medicines || [],
      instructions,
    });

    res.status(201).json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) return res.status(404).json({ success: false, error: 'Prescription not found' });

    await prescription.update(req.body);
    res.json({ success: true, data: prescription });
  } catch (err) {
    next(err);
  }
};
