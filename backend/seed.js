import bcrypt from 'bcryptjs';
import { sequelize } from './src/config/database.js';
import { User, Patient, Doctor } from './src/models/index.js';

const seed = async () => {
  try {
    await sequelize.sync({ force: false });
    const hash = await bcrypt.hash('admin123', 12);

    await User.findOrCreate({
      where: { email: 'admin@hospital.com' },
      defaults: { email: 'admin@hospital.com', password: hash, role: 'super_admin', isActive: true },
    });

    await User.findOrCreate({
      where: { email: 'reception@hospital.com' },
      defaults: { email: 'reception@hospital.com', password: hash, role: 'receptionist', isActive: true },
    });

    await User.findOrCreate({
      where: { email: 'doctor@hospital.com' },
      defaults: { email: 'doctor@hospital.com', password: hash, role: 'doctor', isActive: true },
    });

    await User.findOrCreate({
      where: { email: 'patient@hospital.com' },
      defaults: { email: 'patient@hospital.com', password: hash, role: 'patient', isActive: true },
    });

    console.log('Seed completed. Default credentials:');
    console.log('  super_admin:  admin@hospital.com / admin123');
    console.log('  receptionist: reception@hospital.com / admin123');
    console.log('  doctor:       doctor@hospital.com / admin123');
    console.log('  patient:      patient@hospital.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
