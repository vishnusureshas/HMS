export default (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId:      { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    firstName:   { type: DataTypes.STRING, allowNull: false },
    lastName:    { type: DataTypes.STRING, allowNull: false },
    dateOfBirth: { type: DataTypes.DATEONLY },
    gender:      { type: DataTypes.ENUM('male', 'female', 'other') },
    phone:       { type: DataTypes.STRING },
    address:     { type: DataTypes.TEXT },
    bloodGroup:  { type: DataTypes.STRING },
    avatarUrl:   { type: DataTypes.STRING },
  });
  return Patient;
};
