export default (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId:      { type: DataTypes.UUID, allowNull: false },
    doctorId:       { type: DataTypes.UUID, allowNull: false },
    appointmentId:  { type: DataTypes.UUID },
    medicines:      { type: DataTypes.JSONB },
    instructions:   { type: DataTypes.TEXT },
    isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
  });
  return Prescription;
};
