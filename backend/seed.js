import bcrypt from 'bcryptjs';
import { sequelize } from './src/config/database.js';
import { User, Patient, Doctor } from './src/models/index.js';

// run via: docker exec hospital-backend node seed.js (or CI/CD auto-runs)

const seed = async () => {
  try {
    await sequelize.sync({ force: false });
    const hash = await bcrypt.hash('admin123', 12);

    const users = [
      { email: 'admin@hospital.com', role: 'super_admin' },
      { email: 'reception@hospital.com', role: 'receptionist' },
      { email: 'doctor@hospital.com', role: 'doctor' },
      { email: 'patient@hospital.com', role: 'patient' },
    ];

    for (const u of users) {
      const existing = await User.findOne({ where: { email: u.email } });
      if (existing) {
        await existing.update({ password: hash, isActive: true });
      } else {
        await User.create({ ...u, password: hash, isActive: true });
      }
    }

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
