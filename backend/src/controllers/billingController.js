import { Op } from 'sequelize';
import { Billing, Patient, Appointment, User, AuditLog } from '../models/index.js';

const generateInvoiceNo = () => {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `INV-${y}${m}${d}-${rand}`;
};

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
    if (req.query.patientId) where.patientId = req.query.patientId;
    if (req.query.paymentStatus) where.paymentStatus = req.query.paymentStatus;

    const { rows, count } = await Billing.findAndCountAll({
      where,
      include: [
        { model: Patient, include: [{ model: User, attributes: ['id', 'email'] }] },
      ],
      offset,
      limit,
      order: [['createdAt', 'DESC']],
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
    const billing = await Billing.findByPk(req.params.id, {
      include: [
        { model: Patient, include: [{ model: User, attributes: ['id', 'email'] }] },
      ],
    });

    if (!billing) return res.status(404).json({ success: false, error: 'Billing record not found' });

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== billing.patientId) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    res.json({ success: true, data: billing });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { patientId, appointmentId, items, subtotal, tax, discount, total, dueDate, paymentMethod } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(400).json({ success: false, error: 'Patient not found' });

    const invoiceNo = generateInvoiceNo();

    const billing = await Billing.create({
      patientId,
      appointmentId: appointmentId || null,
      invoiceNo,
      items: items || [],
      subtotal,
      tax: tax || 0,
      discount: discount || 0,
      total,
      paidAmount: 0,
      dueAmount: total,
      paymentMethod: paymentMethod || null,
      paymentStatus: 'pending',
      dueDate: dueDate || null,
    });

    await AuditLog.create({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'Billing',
      entityId: billing.id,
    });

    res.status(201).json({ success: true, data: billing });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const billing = await Billing.findByPk(req.params.id);
    if (!billing) return res.status(404).json({ success: false, error: 'Billing record not found' });

    await billing.update(req.body);

    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'Billing',
      entityId: billing.id,
    });

    res.json({ success: true, data: billing });
  } catch (err) {
    next(err);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;

    const billing = await Billing.findByPk(req.params.id);
    if (!billing) return res.status(404).json({ success: false, error: 'Billing record not found' });

    if (billing.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, error: 'Bill is already fully paid' });
    }

    const paidAmount = parseFloat(billing.paidAmount) + parseFloat(amount);
    const total = parseFloat(billing.total);

    billing.paidAmount = paidAmount;
    billing.dueAmount = Math.max(0, total - paidAmount);
    billing.paymentStatus = billing.dueAmount <= 0 ? 'paid' : 'partial';
    if (paymentMethod) billing.paymentMethod = paymentMethod;

    await billing.save();

    await AuditLog.create({
      userId: req.user.id,
      action: 'RECORD_PAYMENT',
      entity: 'Billing',
      entityId: billing.id,
    });

    res.json({ success: true, data: billing });
  } catch (err) {
    next(err);
  }
};
