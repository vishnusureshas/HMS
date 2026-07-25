import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Patient, Doctor, AuditLog } from '../models/index.js';
import { env } from '../config/env.js';

export const register = async (req, res) => {
  const { email, password, role, ...profile } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(400).json({ success: false, error: 'Email already registered.' });
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, password: hash, role });

  if (role === 'patient') {
    await Patient.create({ userId: user.id, ...profile });
  }
  if (role === 'doctor') {
    await Doctor.create({ userId: user.id, ...profile });
  }

  res.status(201).json({ success: true, data: { userId: user.id, email: user.email, role: user.role } });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, error: 'Account is deactivated.' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  await AuditLog.create({
    userId: user.id,
    action: 'LOGIN',
    entity: 'User',
    entityId: user.id,
  });

  res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, email: user.email, role: user.role },
    },
  });
};

export const me = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] },
    include: [
      { model: Patient, required: false },
      { model: Doctor, required: false },
    ],
  });
  res.json({ success: true, data: user });
};
