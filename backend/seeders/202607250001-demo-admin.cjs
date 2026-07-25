const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const hash = await bcrypt.hash('Admin@123', 12);
    await queryInterface.bulkInsert('Users', [{
      id:        '00000000-0000-0000-0000-000000000001',
      email:     'admin@hospital.com',
      password:  hash,
      role:      'super_admin',
      isActive:  true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', { email: 'admin@hospital.com' });
  },
};
