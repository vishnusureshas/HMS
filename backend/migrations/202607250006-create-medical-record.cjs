module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MedicalRecords', {
      id:           { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      patientId:    { type: Sequelize.UUID, allowNull: false, references: { model: 'Patients', key: 'id' }, onDelete: 'CASCADE' },
      doctorId:     { type: Sequelize.UUID, allowNull: false, references: { model: 'Doctors', key: 'id' } },
      appointmentId:{ type: Sequelize.UUID, references: { model: 'Appointments', key: 'id' } },
      diagnosis:    { type: Sequelize.TEXT },
      symptoms:     { type: Sequelize.TEXT },
      notes:        { type: Sequelize.TEXT },
      attachments:  { type: Sequelize.JSONB },
      createdAt:    { allowNull: false, type: Sequelize.DATE },
      updatedAt:    { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('MedicalRecords');
  },
};
