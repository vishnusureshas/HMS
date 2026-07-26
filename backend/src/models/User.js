export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id:                  { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email:               { type: DataTypes.STRING, unique: true, allowNull: false },
    password:            { type: DataTypes.STRING, allowNull: false },
    role:                { type: DataTypes.ENUM('super_admin', 'admin', 'doctor', 'receptionist', 'patient'), defaultValue: 'patient' },
    isActive:            { type: DataTypes.BOOLEAN, defaultValue: true },
    resetPasswordToken:  { type: DataTypes.STRING },
    resetPasswordExpires:{ type: DataTypes.DATE },
  }, { paranoid: true });
  return User;
};
