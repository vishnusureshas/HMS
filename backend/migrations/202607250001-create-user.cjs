module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id:        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      email:     { type: Sequelize.STRING, allowNull: false, unique: true },
      password:  { type: Sequelize.STRING, allowNull: false },
      role:      { type: Sequelize.ENUM('super_admin','admin','doctor','receptionist','patient'), defaultValue: 'patient' },
      isActive:  { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
      deletedAt: { type: Sequelize.DATE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Users');
  },
};
