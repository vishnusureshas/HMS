export default (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId:    { type: DataTypes.UUID },
    action:    { type: DataTypes.STRING },
    entity:    { type: DataTypes.STRING },
    entityId:  { type: DataTypes.UUID },
    oldValue:  { type: DataTypes.JSONB },
    newValue:  { type: DataTypes.JSONB },
    ipAddress: { type: DataTypes.STRING },
  }, { timestamps: true });
  return AuditLog;
};
