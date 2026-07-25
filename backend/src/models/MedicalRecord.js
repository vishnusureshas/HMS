export default (sequelize, DataTypes) => {
  const MedicalRecord = sequelize.define('MedicalRecord', {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId:    { type: DataTypes.UUID, allowNull: false },
    doctorId:     { type: DataTypes.UUID, allowNull: false },
    appointmentId:{ type: DataTypes.UUID },
    diagnosis:    { type: DataTypes.TEXT },
    symptoms:     { type: DataTypes.TEXT },
    notes:        { type: DataTypes.TEXT },
    attachments:  { type: DataTypes.JSONB },
  });
  return MedicalRecord;
};
