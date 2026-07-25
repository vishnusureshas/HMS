export default (sequelize, DataTypes) => {
  const Billing = sequelize.define('Billing', {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId:    { type: DataTypes.UUID, allowNull: false },
    appointmentId:{ type: DataTypes.UUID },
    invoiceNo:    { type: DataTypes.STRING, unique: true },
    items:        { type: DataTypes.JSONB },
    subtotal:     { type: DataTypes.DECIMAL(12,2) },
    tax:          { type: DataTypes.DECIMAL(10,2) },
    discount:     { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    total:        { type: DataTypes.DECIMAL(12,2) },
    paidAmount:   { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
    dueAmount:    { type: DataTypes.DECIMAL(12,2) },
    paymentMethod:{ type: DataTypes.ENUM('cash', 'card', 'insurance', 'online') },
    paymentStatus:{ type: DataTypes.ENUM('pending', 'partial', 'paid', 'refunded'), defaultValue: 'pending' },
    dueDate:      { type: DataTypes.DATEONLY },
  });
  return Billing;
};
