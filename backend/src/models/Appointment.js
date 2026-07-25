export default (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId:       { type: DataTypes.UUID, allowNull: false },
    doctorId:        { type: DataTypes.UUID, allowNull: false },
    appointmentDate: { type: DataTypes.DATE, allowNull: false },
    status:          { type: DataTypes.ENUM('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'), defaultValue: 'scheduled' },
    type:            { type: DataTypes.ENUM('in_person', 'video', 'phone') },
    notes:           { type: DataTypes.TEXT },
    createdBy:       { type: DataTypes.UUID },
  });
  return Appointment;
};
