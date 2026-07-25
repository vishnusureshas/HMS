module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AuditLogs', {
      id:        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId:    { type: Sequelize.UUID, references: { model: 'Users', key: 'id' } },
      action:    { type: Sequelize.STRING },
      entity:    { type: Sequelize.STRING },
      entityId:  { type: Sequelize.UUID },
      oldValue:  { type: Sequelize.JSONB },
      newValue:  { type: Sequelize.JSONB },
      ipAddress: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('AuditLogs');
  },
};
