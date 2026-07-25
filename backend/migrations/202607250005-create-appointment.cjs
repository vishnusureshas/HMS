module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Appointments', {
      id:              { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      patientId:       { type: Sequelize.UUID, allowNull: false, references: { model: 'Patients', key: 'id' }, onDelete: 'CASCADE' },
      doctorId:        { type: Sequelize.UUID, allowNull: false, references: { model: 'Doctors', key: 'id' }, onDelete: 'CASCADE' },
      appointmentDate: { type: Sequelize.DATE, allowNull: false },
      status:          { type: Sequelize.ENUM('scheduled','checked_in','in_progress','completed','cancelled','no_show'), defaultValue: 'scheduled' },
      type:            { type: Sequelize.ENUM('in_person','video','phone') },
      notes:           { type: Sequelize.TEXT },
      createdBy:       { type: Sequelize.UUID },
      createdAt:       { allowNull: false, type: Sequelize.DATE },
      updatedAt:       { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Appointments');
  },
};
