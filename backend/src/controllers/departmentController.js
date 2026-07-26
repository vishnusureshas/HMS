import { Department, Doctor } from '../models/index.js';
import { Op } from 'sequelize';

export const list = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.active === 'true') where.isActive = true;

    const departments = await Department.findAll({
      where,
      include: [{ model: Doctor, attributes: ['id', 'firstName', 'lastName'] }],
      order: [['name', 'ASC']],
    });

    res.json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id, {
      include: [{ model: Doctor }],
    });

    if (!department) return res.status(404).json({ success: false, error: 'Department not found' });

    res.json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existing = await Department.findOne({ where: { name } });
    if (existing) return res.status(400).json({ success: false, error: 'Department already exists' });

    const department = await Department.create({ name, description });
    res.status(201).json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ success: false, error: 'Department not found' });

    if (req.body.name && req.body.name !== department.name) {
      const existing = await Department.findOne({ where: { name: req.body.name } });
      if (existing) return res.status(400).json({ success: false, error: 'Department name already in use' });
    }

    await department.update(req.body);
    res.json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ success: false, error: 'Department not found' });

    const doctorCount = await Doctor.count({ where: { departmentId: req.params.id } });
    if (doctorCount > 0) {
      return res.status(400).json({ success: false, error: `Cannot delete department with ${doctorCount} active doctor(s)` });
    }

    await department.destroy();
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    next(err);
  }
};
