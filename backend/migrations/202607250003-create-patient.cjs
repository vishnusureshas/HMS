module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Patients', {
      id:          { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      userId:      { type: Sequelize.UUID, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      firstName:   { type: Sequelize.STRING, allowNull: false },
      lastName:    { type: Sequelize.STRING, allowNull: false },
      dateOfBirth: { type: Sequelize.DATEONLY },
      gender:      { type: Sequelize.ENUM('male','female','other') },
      phone:       { type: Sequelize.STRING },
      address:     { type: Sequelize.TEXT },
      bloodGroup:  { type: Sequelize.STRING },
      avatarUrl:   { type: Sequelize.STRING },
      createdAt:   { allowNull: false, type: Sequelize.DATE },
      updatedAt:   { allowNull: false, type: Sequelize.DATE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Patients');
  },
};
