export default (sequelize, DataTypes) => {
  const Doctor = sequelize.define('Doctor', {
    id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId:         { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
    departmentId:   { type: DataTypes.UUID, references: { model: 'Departments', key: 'id' } },
    firstName:      { type: DataTypes.STRING, allowNull: false },
    lastName:       { type: DataTypes.STRING, allowNull: false },
    specialization: { type: DataTypes.STRING },
    licenseNumber:  { type: DataTypes.STRING, unique: true },
    consultationFee:{ type: DataTypes.DECIMAL(10,2) },
    availableDays:  { type: DataTypes.JSONB },
    availableTime:  { type: DataTypes.JSONB },
    isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
  });
  return Doctor;
};
