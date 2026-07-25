module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Prescriptions', {
      id:            { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      patientId:     { type: Sequelize.UUID, allowNull: false, references: { model: 'Patients', key: 'id' }, onDelete: 'CASCADE' },
      doctorId:      { type: Sequelize.UUID, allowNull: false, references: { model: 'Doctors', key: 'id' } },
      appointmentId: { type: Sequelize.UUID, references: { model: 'Appointments', key: 'id' } },
      medicines:     { type: Sequelize.JSONB },
      instructions:  { type: Sequelize.TEXT },
      isActive:      { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt:     { allowNull: false, type: Sequelize.DATE },
      updatedAt:     { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Prescriptions');
  },
};
