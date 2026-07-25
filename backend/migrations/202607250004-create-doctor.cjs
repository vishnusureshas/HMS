module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Doctors', {
      id:              { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId:          { type: Sequelize.UUID, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      departmentId:    { type: Sequelize.UUID, references: { model: 'Departments', key: 'id' } },
      firstName:       { type: Sequelize.STRING, allowNull: false },
      lastName:        { type: Sequelize.STRING, allowNull: false },
      specialization:  { type: Sequelize.STRING },
      licenseNumber:   { type: Sequelize.STRING, unique: true },
      consultationFee: { type: Sequelize.DECIMAL(10,2) },
      availableDays:   { type: Sequelize.JSONB },
      availableTime:   { type: Sequelize.JSONB },
      isActive:        { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:       { allowNull: false, type: Sequelize.DATE },
      updatedAt:       { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Doctors');
  },
};
