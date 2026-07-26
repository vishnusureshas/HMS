import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';
import defineUser          from './User.js';
import definePatient       from './Patient.js';
import defineDoctor        from './Doctor.js';
import defineDepartment    from './Department.js';
import defineAppointment   from './Appointment.js';
import defineMedicalRecord from './MedicalRecord.js';
import definePrescription  from './Prescription.js';
import defineBilling       from './Billing.js';
import defineAuditLog      from './AuditLog.js';

const User          = defineUser(sequelize, DataTypes);
const Patient       = definePatient(sequelize, DataTypes);
const Doctor        = defineDoctor(sequelize, DataTypes);
const Department    = defineDepartment(sequelize, DataTypes);
const Appointment   = defineAppointment(sequelize, DataTypes);
const MedicalRecord = defineMedicalRecord(sequelize, DataTypes);
const Prescription  = definePrescription(sequelize, DataTypes);
const Billing       = defineBilling(sequelize, DataTypes);
const AuditLog      = defineAuditLog(sequelize, DataTypes);

User.hasOne(Patient, { foreignKey: 'userId' });
Patient.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Doctor, { foreignKey: 'userId' });
Doctor.belongsTo(User, { foreignKey: 'userId' });

Department.hasMany(Doctor, { foreignKey: 'departmentId' });
Doctor.belongsTo(Department, { foreignKey: 'departmentId' });

Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });

Patient.hasMany(MedicalRecord, { foreignKey: 'patientId' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctorId' });

Patient.hasMany(Prescription, { foreignKey: 'patientId' });
Prescription.belongsTo(Patient, { foreignKey: 'patientId' });
Prescription.belongsTo(Doctor, { foreignKey: 'doctorId' });

Patient.hasMany(Billing, { foreignKey: 'patientId' });
Billing.belongsTo(Patient, { foreignKey: 'patientId' });

AuditLog.belongsTo(User, { foreignKey: 'userId' });

export {
  sequelize, User, Patient, Doctor, Department,
  Appointment, MedicalRecord, Prescription, Billing, AuditLog,
};
