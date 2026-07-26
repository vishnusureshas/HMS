import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User, Patient, Doctor, AuditLog } from '../models/index.js';
import { env } from '../config/env.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 3600000);
  await user.save();

  await sendPasswordResetEmail(user.email, token);

  res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
  }

  const hash = await bcrypt.hash(password, 12);
  user.password = hash;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  await AuditLog.create({
    userId: user.id,
    action: 'PASSWORD_RESET',
    entity: 'User',
    entityId: user.id,
  });

  res.json({ success: true, message: 'Password has been reset successfully.' });
};

export const refreshToken = async (req, res) => {
  const bearer = req.headers.authorization;
  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token required.' });
  }

  try {
    const decoded = jwt.verify(bearer.slice(7), env.jwt.secret, { ignoreExpiration: true });
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid token.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    res.json({ success: true, data: { token } });
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};
