module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Billings', {
      id:            { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      patientId:     { type: Sequelize.UUID, allowNull: false, references: { model: 'Patients', key: 'id' }, onDelete: 'CASCADE' },
      appointmentId: { type: Sequelize.UUID, references: { model: 'Appointments', key: 'id' } },
      invoiceNo:     { type: Sequelize.STRING, unique: true },
      items:         { type: Sequelize.JSONB },
      subtotal:      { type: Sequelize.DECIMAL(12,2) },
      tax:           { type: Sequelize.DECIMAL(10,2) },
      discount:      { type: Sequelize.DECIMAL(10,2), defaultValue: 0 },
      total:         { type: Sequelize.DECIMAL(12,2) },
      paidAmount:    { type: Sequelize.DECIMAL(12,2), defaultValue: 0 },
      dueAmount:     { type: Sequelize.DECIMAL(12,2) },
      paymentMethod: { type: Sequelize.ENUM('cash','card','insurance','online') },
      paymentStatus: { type: Sequelize.ENUM('pending','partial','paid','refunded'), defaultValue: 'pending' },
      dueDate:       { type: Sequelize.DATEONLY },
      createdAt:     { allowNull: false, type: Sequelize.DATE },
      updatedAt:     { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Billings');
  },
};
