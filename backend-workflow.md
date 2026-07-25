# Hospital Management System — Backend Workflow (PERN Stack)

> **Tech Stack:** PostgreSQL, Express, React, Node.js, AWS EC2, AWS S3

---

## Table of Contents

1. [Project Setup & Architecture](#1-project-setup--architecture)
2. [Database Design & Migrations](#2-database-design--migrations)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Core Modules (CRUD)](#4-core-modules-crud)
5. [File Uploads (AWS S3)](#5-file-uploads-aws-s3)
6. [Admin Panel (RBAC & Dashboard)](#6-admin-panel-rbac--dashboard)
7. [API Documentation (Swagger)](#7-api-documentation-swagger)
8. [Testing (Unit & Integration)](#8-testing-unit--integration)
9. [Dockerization](#9-dockerization)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Deployment to AWS EC2](#11-deployment-to-aws-ec2)
12. [Monitoring, Logging & Backup](#12-monitoring-logging--backup)
13. [Post-Deployment Checklist](#13-post-deployment-checklist)

---

## 1. Project Setup & Architecture

### 1.1 Initialize the Project

```bash
mkdir hospital-management-backend
cd hospital-management-backend
npm init -y
# Add "type": "module" to package.json for ES module support
```

### 1.2 Install Core Dependencies

```bash
npm install express pg sequelize cors helmet morgan dotenv bcryptjs jsonwebtoken
npm install multer multer-s3 aws-sdk @aws-sdk/client-s3
npm install express-validator socket.io winston
npm install --save-dev nodemon jest supertest eslint prettier
```

### 1.3 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Sequelize connection
│   │   ├── s3.js                # AWS S3 client
│   │   └── env.js               # Environment variables
│   ├── middlewares/
│   │   ├── auth.js              # JWT verification
│   │   ├── adminAuth.js         # Admin role check
│   │   ├── upload.js            # Multer + S3 upload
│   │   └── errorHandler.js      # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── MedicalRecord.js
│   │   ├── Prescription.js
│   │   ├── Billing.js
│   │   ├── Department.js
│   │   └── AuditLog.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   ├── billingController.js
│   │   ├── adminController.js
│   │   └── uploadController.js
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── adminRoutes.js
│   │   └── uploadRoutes.js
│   ├── services/
│   │   ├── s3Service.js
│   │   └── emailService.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── appointmentValidator.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── response.js          # Standardized API response
│   │   └── constants.js
│   └── app.js                   # Express app setup
├── migrations/
├── seeders/
├── tests/
├── docker/
├── .env.example
├── .eslintrc.js
├── Dockerfile
├── docker-compose.yml
└── package.json
```

### 1.4 Entry Point

```js
// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routes);
app.use(errorHandler);

export default app;
```

```js
// server.js
import 'dotenv/config';
import app from './src/app.js';
import { sequelize } from './src/config/database.js';

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
}

start();
```

---

## 2. Database Design & Migrations

### 2.1 Database Configuration

```js
// src/config/database.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  }
);

export { sequelize };
```

### 2.2 Entity Relationship Diagram (Conceptual)

```
Users ──> Patients
Users ──> Doctors ──> Departments
Doctors ──> Appointments ──> Patients
Appointments ──> MedicalRecords
MedicalRecords ──> Prescriptions
Patients ──> Billings
Users ──> AuditLogs
```

### 2.3 Key Models

```js
// src/models/User.js
export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email:     { type: DataTypes.STRING, unique: true, allowNull: false },
    password:  { type: DataTypes.STRING, allowNull: false },
    role:      { type: DataTypes.ENUM('super_admin', 'admin', 'doctor', 'receptionist', 'patient'), defaultValue: 'patient' },
    isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { paranoid: true });
  return User;
};
```

```js
// src/models/Patient.js
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
```

```js
// src/models/Doctor.js
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
```

```js
// src/models/Appointment.js
export default (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId:   { type: DataTypes.UUID, allowNull: false },
    doctorId:    { type: DataTypes.UUID, allowNull: false },
    appointmentDate: { type: DataTypes.DATE, allowNull: false },
    status:      { type: DataTypes.ENUM('scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'), defaultValue: 'scheduled' },
    type:        { type: DataTypes.ENUM('in_person', 'video', 'phone') },
    notes:       { type: DataTypes.TEXT },
    createdBy:   { type: DataTypes.UUID },
  });
  return Appointment;
};
```

```js
// src/models/MedicalRecord.js
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
```

```js
// src/models/Billing.js
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
```

```js
// src/models/AuditLog.js
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
```

### 2.4 Associations (index.js)

```js
// src/models/index.js
import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';
import defineUser          from './User.js';
import definePatient       from './Patient.js';
import defineDoctor        from './Doctor.js';
import defineAppointment   from './Appointment.js';
import defineMedicalRecord from './MedicalRecord.js';
import definePrescription  from './Prescription.js';
import defineBilling       from './Billing.js';
import defineDepartment    from './Department.js';
import defineAuditLog      from './AuditLog.js';

const User          = defineUser(sequelize, DataTypes);
const Patient       = definePatient(sequelize, DataTypes);
const Doctor        = defineDoctor(sequelize, DataTypes);
const Appointment   = defineAppointment(sequelize, DataTypes);
const MedicalRecord = defineMedicalRecord(sequelize, DataTypes);
const Prescription  = definePrescription(sequelize, DataTypes);
const Billing       = defineBilling(sequelize, DataTypes);
const Department    = defineDepartment(sequelize, DataTypes);
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

Patient.hasMany(Billing, { foreignKey: 'patientId' });
Billing.belongsTo(Patient, { foreignKey: 'patientId' });

export {
  sequelize, User, Patient, Doctor, Appointment,
  MedicalRecord, Prescription, Billing, Department, AuditLog,
};
```

### 2.5 Migrations with Sequelize CLI

```bash
npm install --save-dev sequelize-cli
npx sequelize-cli init
npx sequelize-cli model:generate --name User --attributes email:string,password:string,role:enum
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

**Migration file example:**

```js
// migrations/XXXXXX-create-user.js
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id:        { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      email:     { type: Sequelize.STRING, allowNull: false, unique: true },
      password:  { type: Sequelize.STRING, allowNull: false },
      role:      { type: Sequelize.ENUM('super_admin','admin','doctor','receptionist','patient'), defaultValue: 'patient' },
      isActive:  { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
      deletedAt: { type: Sequelize.DATE },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Users');
  },
};
```

### 2.6 Seeders (Default Admin)

```js
// seeders/XXXXXX-demo-admin.js
import bcrypt from 'bcryptjs';

export default {
  up: async (queryInterface) => {
    const hash = await bcrypt.hash('Admin@123', 12);
    await queryInterface.bulkInsert('Users', [{
      id:        '00000000-0000-0000-0000-000000000001',
      email:     'admin@hospital.com',
      password:  hash,
      role:      'super_admin',
      isActive:  true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Users', { email: 'admin@hospital.com' });
  },
};
```

---

## 3. Authentication & Authorization

### 3.1 Auth Middleware

```js
// src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid token' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};
```

### 3.2 Auth Controller

```js
// src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Patient, Doctor, AuditLog } from '../models/index.js';

export const register = async (req, res) => {
  const { email, password, role, ...profile } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, password: hash, role });
  if (role === 'patient') await Patient.create({ userId: user.id, ...profile });
  if (role === 'doctor')  await Doctor.create({ userId: user.id, ...profile });
  res.status(201).json({ message: 'User created', userId: user.id });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
  await AuditLog.create({ userId: user.id, action: 'LOGIN', entity: 'User', entityId: user.id });
  res.json({ token, role: user.role });
};

export const me = async (req, res) => {
  res.json(req.user);
};
```

### 3.3 Password & Token Management

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/auth/register` | POST | Register (patient/doctor) |
| `/api/v1/auth/login` | POST | Login → JWT |
| `/api/v1/auth/me` | GET | Current user profile |
| `/api/v1/auth/forgot-password` | POST | Send reset email |
| `/api/v1/auth/reset-password/:token` | POST | Reset password |
| `/api/v1/auth/refresh` | POST | Refresh JWT |

---

## 4. Core Modules (CRUD)

### 4.1 Route Structure

```js
// src/routes/index.js
import { Router } from 'express';
import authRoutes from './authRoutes.js';
import patientRoutes from './patientRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import billingRoutes from './billingRoutes.js';
import adminRoutes from './adminRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/billing', billingRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

export default router;
```

### 4.2 Sample Route File (Appointments)

```js
// src/routes/appointmentRoutes.js
import { Router } from 'express';
import * as ctrl from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateAppointment } from '../validators/appointmentValidator.js';

const router = Router();

router.use(authenticate);

router.get('/',        ctrl.list);
router.get('/:id',     ctrl.getById);
router.post('/',       authorize('admin','receptionist','doctor'), validateAppointment, ctrl.create);
router.put('/:id',     authorize('admin','receptionist','doctor'), ctrl.update);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id',  authorize('admin'), ctrl.remove);

export default router;
```

### 4.3 Sample Controller (Appointments)

```js
// src/controllers/appointmentController.js
import { Appointment, Patient, Doctor, AuditLog } from '../models/index.js';

export const list = async (req, res) => {
  const where = {};
  if (req.user.role === 'patient') where.patientId = req.user.Patient?.id;
  if (req.user.role === 'doctor')  where.doctorId = req.user.Doctor?.id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.date)   where.appointmentDate = req.query.date;

  const appointments = await Appointment.findAll({
    where,
    include: [Patient, Doctor],
    order: [['appointmentDate', 'DESC']],
  });
  res.json(appointments);
};

export const create = async (req, res) => {
  const appointment = await Appointment.create({
    ...req.body,
    createdBy: req.user.id,
  });
  await AuditLog.create({ userId: req.user.id, action: 'CREATE', entity: 'Appointment', entityId: appointment.id });
  res.status(201).json(appointment);
};

export const updateStatus = async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findByPk(req.params.id);
  if (!appointment) return res.status(404).json({ error: 'Not found' });
  appointment.status = status;
  await appointment.save();
  res.json(appointment);
};
```

### 4.4 Validator Example

```js
// src/validators/appointmentValidator.js
import { body, validationResult } from 'express-validator';

export const validateAppointment = [
  body('patientId').isUUID().withMessage('Valid patient ID required'),
  body('doctorId').isUUID().withMessage('Valid doctor ID required'),
  body('appointmentDate').isISO8601().withMessage('Valid date required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];
```

### 4.5 CRUD Endpoints Summary

| Module | Endpoints | Auth |
|---|---|---|
| **Patients** | GET /, GET /:id, POST /, PUT /:id, DELETE /:id | Admin, Doctor, Receptionist |
| **Doctors** | GET /, GET /:id, POST /, PUT /:id, DELETE /:id | Admin, Public (GET) |
| **Appointments** | GET /, GET /:id, POST /, PUT /:id, PATCH /:id/status, DELETE /:id | Role-based |
| **Billing** | GET /, GET /:id, POST /, PUT /:id, POST /:id/payment | Admin, Receptionist |
| **Departments** | GET /, POST /, PUT /:id, DELETE /:id | Admin |
| **Medical Records** | GET /patient/:patientId, POST /, PUT /:id | Doctor, Admin |
| **Prescriptions** | GET /patient/:patientId, POST /, PUT /:id | Doctor |

---

## 5. File Uploads (AWS S3)

### 5.1 S3 Configuration

```js
// src/config/s3.js
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export { s3Client };
```

### 5.2 Environment Variables

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=hospital-uploads
S3_UPLOAD_DIR_IMAGES=images
S3_UPLOAD_DIR_AUDIO=audio
S3_UPLOAD_DIR_DOCUMENTS=documents
```

### 5.3 Multer + S3 Upload Middleware

```js
// src/middlewares/upload.js
import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client } from '../config/s3.js';

const storage = multerS3({
  s3: s3Client,
  bucket: process.env.AWS_S3_BUCKET,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const folder = file.mimetype.startsWith('image/')
      ? process.env.S3_UPLOAD_DIR_IMAGES
      : file.mimetype.startsWith('audio/')
        ? process.env.S3_UPLOAD_DIR_AUDIO
        : process.env.S3_UPLOAD_DIR_DOCUMENTS;
    const key = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, key);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImages = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedAudio  = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
  const allowedDocs   = ['application/pdf', 'application/msword', 'text/plain'];

  if ([...allowedImages, ...allowedAudio, ...allowedDocs].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export default upload;
```

### 5.4 Upload Controller

```js
// src/controllers/uploadController.js
import { MedicalRecord, AuditLog } from '../models/index.js';
import { s3Client } from '../config/s3.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export const uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  res.json({
    url: req.file.location,
    key: req.file.key,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
};

export const uploadMedicalAttachment = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const record = await MedicalRecord.findByPk(req.params.recordId);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  const attachments = record.attachments || [];
  attachments.push({ url: req.file.location, key: req.file.key, uploadedAt: new Date() });
  record.attachments = attachments;
  await record.save();
  res.json(record);
};

export const deleteFile = async (req, res) => {
  await s3Client.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: req.params.key,
  }));
  res.json({ message: 'File deleted' });
};
```

### 5.5 Upload Routes

```js
// src/routes/uploadRoutes.js
import { Router } from 'express';
import upload from '../middlewares/upload.js';
import * as ctrl from '../controllers/uploadController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.post('/single', upload.single('file'), ctrl.uploadFile);
router.post('/multiple', upload.array('files', 10), ctrl.uploadMultiple);
router.post('/medical-record/:recordId', authorize('doctor','admin'), upload.single('file'), ctrl.uploadMedicalAttachment);
router.delete('/:key', authorize('admin'), ctrl.deleteFile);

export default router;
```

### 5.6 Frontend Upload Integration (React)

```jsx
const uploadToS3 = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await axios.post('/api/v1/upload/single', formData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
};
```

---

## 6. Admin Panel (RBAC & Dashboard)

### 6.1 RBAC Design

| Role | Permissions |
|---|---|
| **super_admin** | Full access — users, roles, system config, audit logs |
| **admin** | All CRUD except role management & system config |
| **doctor** | View patients, manage appointments, write records & prescriptions |
| **receptionist** | Manage appointments, patient registration, billing |
| **patient** | View own records, appointments, bills |

### 6.2 Admin Controller

```js
// src/controllers/adminController.js
import { User, Patient, Doctor, Appointment, Billing, AuditLog } from '../models/index.js';
import { Op } from 'sequelize';

export const dashboard = async (req, res) => {
  const today = new Date().toISOString().slice(0,10);
  const [
    totalPatients, totalDoctors, todayAppointments, revenue, recentAppointments,
  ] = await Promise.all([
    Patient.count(),
    Doctor.count({ where: { isActive: true } }),
    Appointment.count({ where: { appointmentDate: { [Op.gte]: today } } }),
    Billing.sum('total', { where: { paymentStatus: 'paid' } }),
    Appointment.findAll({ limit: 10, order: [['createdAt','DESC']], include: [Patient, Doctor] }),
  ]);

  res.json({
    stats: { totalPatients, totalDoctors, todayAppointments, revenue },
    recentAppointments,
  });
};

export const listUsers = async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    include: [{ model: Patient }, { model: Doctor }],
  });
  res.json(users);
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.role = role;
  await user.save();
  await AuditLog.create({ userId: req.user.id, action: 'UPDATE', entity: 'User', entityId: user.id });
  res.json(user);
};

export const toggleUserActive = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  user.isActive = !user.isActive;
  await user.save();
  res.json(user);
};

export const auditLogs = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const { rows, count } = await AuditLog.findAndCountAll({
    limit, offset, order: [['createdAt', 'DESC']],
  });
  res.json({ data: rows, total: count, page, pages: Math.ceil(count / limit) });
};

export const getSettings = async (req, res) => { /* GET system config */ };
export const updateSettings = async (req, res) => { /* UPDATE system config */ };
```

### 6.3 Admin Routes

```js
// src/routes/adminRoutes.js
import { Router } from 'express';
import * as ctrl from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('super_admin', 'admin'));

router.get('/dashboard', ctrl.dashboard);
router.get('/users', ctrl.listUsers);
router.put('/users/:id/role', authorize('super_admin'), ctrl.updateUserRole);
router.patch('/users/:id/toggle-active', ctrl.toggleUserActive);
router.get('/audit-logs', ctrl.auditLogs);
router.get('/settings', ctrl.getSettings);
router.put('/settings', authorize('super_admin'), ctrl.updateSettings);

export default router;
```

### 6.4 Audit Trail Middleware (Automatic Logging)

```js
// src/middlewares/audit.js
import { AuditLog } from '../models/index.js';

export const audit = (action, entity) => async (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (res.statusCode < 400) {
      await AuditLog.create({
        userId: req.user?.id,
        action,
        entity,
        entityId: req.params.id || body?.id,
        ipAddress: req.ip,
      });
    }
    return originalJson(body);
  };
  next();
};
```

---

## 7. API Documentation (Swagger)

### 7.1 Setup

```bash
npm install swagger-jsdoc swagger-ui-express
```

### 7.2 Swagger Config

```js
// src/config/swagger.js
import swaggerJsDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Management System API',
      version: '1.0.0',
      description: 'PERN Stack Hospital Management Backend',
    },
    servers: [{ url: '/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

export default swaggerJsDoc(options);
```

```js
// src/app.js
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
```

### 7.3 Inline JSDoc in Routes

```js
/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: List appointments
 *     tags: [Appointments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/', ctrl.list);
```

---

## 8. Testing (Unit & Integration)

### 8.1 Jest Setup

```js
// jest.config.js
export default {
  testEnvironment: 'node',
  setupFilesAfterSetup: ['./tests/setup.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/migrations/', '/seeders/'],
};
```

### 8.2 Test Setup

```js
// tests/setup.js
import { sequelize } from '../src/models/index.js';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
```

### 8.3 Sample Test

```js
// tests/auth.test.js
import request from 'supertest';
import app from '../src/app.js';

describe('POST /api/v1/auth/register', () => {
  it('should register a new patient', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@test.com', password: 'Pass123!', role: 'patient', firstName: 'John', lastName: 'Doe' });
    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@test.com', password: 'Pass123!', role: 'patient', firstName: 'Jane', lastName: 'Doe' });
    expect(res.statusCode).toBe(400);
  });
});
```

### 8.4 Run Tests

```bash
npm test                 # unit tests
npm run test:coverage    # with coverage report
npm run test:integration # integration tests
```

---

## 9. Dockerization

### 9.1 Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache tini
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
```

### 9.2 Docker Compose (Local Dev)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: hospital-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: hospital
      POSTGRES_USER: hospital_user
      POSTGRES_PASSWORD: hospital_pass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: .
    container_name: hospital-api
    restart: unless-stopped
    ports:
      - "5000:5000"
    depends_on:
      - postgres
    env_file: .env
    environment:
      DB_HOST: postgres
    volumes:
      - ./src:/app/src:ro

volumes:
  pgdata:
```

### 9.3 Build & Run

```bash
docker-compose up -d              # Start all services
docker-compose up -d --build      # Rebuild & start
docker-compose logs -f backend    # Stream logs
docker-compose down               # Stop
```

---

## 10. CI/CD Pipeline

### 10.1 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: hospital_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
        env:
          DB_HOST: localhost
          DB_NAME: hospital_test
          DB_USER: test_user
          DB_PASSWORD: test_pass

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v3
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: hospital-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2 via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/hospital
            aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }}
            docker pull ${{ secrets.ECR_REGISTRY }}/hospital-backend:${{ github.sha }}
            docker-compose up -d
            docker image prune -f
```

---

## 11. Deployment to AWS EC2

### 11.1 EC2 Instance Setup

```bash
# SSH into instance
ssh -i hospital-key.pem ubuntu@<EC2-PUBLIC-IP>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install AWS CLI
sudo apt install -y awscli

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

### 11.2 Nginx Reverse Proxy Config

```nginx
# /etc/nginx/sites-available/hospital-api
server {
    listen 80;
    server_name api.hospital.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 100M;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/hospital-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 11.3 SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.hospital.com
```

### 11.4 Environment File on EC2

```bash
mkdir -p /home/ubuntu/hospital
nano /home/ubuntu/hospital/.env
```

```env
NODE_ENV=production
PORT=5000
DB_HOST=hospital-db.c9xwq.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=hospital_prod
DB_USER=prod_user
DB_PASSWORD=strong_password
JWT_SECRET=your_jwt_secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=hospital-uploads-prod
```

### 11.5 Deploy via Docker Compose (EC2)

```yaml
# /home/ubuntu/hospital/docker-compose.yml
version: '3.8'

services:
  backend:
    image: <ECR_REGISTRY>/hospital-backend:latest
    restart: unless-stopped
    ports:
      - "5000:5000"
    env_file: .env
```

```bash
# Pull & restart
docker-compose down && docker-compose pull && docker-compose up -d
```

### 11.6 Connect RDS (PostgreSQL)

```bash
# Create RDS via AWS CLI or Console
aws rds create-db-instance \
  --db-instance-identifier hospital-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username prod_user \
  --master-user-password strong_password \
  --allocated-storage 20 \
  --publicly-accessible \
  --port 5432

# Run migrations on EC2
docker exec $(docker ps -q --filter name=hospital) npx sequelize-cli db:migrate
docker exec $(docker ps -q --filter name=hospital) npx sequelize-cli db:seed:all
```

---

## 12. Monitoring, Logging & Backup

### 12.1 Centralized Logging (Winston + CloudWatch)

```js
// src/utils/logger.js
import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.cli() }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new WinstonCloudWatch({
    logGroupName: 'hospital-backend',
    logStreamName: `api-${new Date().toISOString().split('T')[0]}`,
    awsRegion: process.env.AWS_REGION,
  }));
}

export default logger;
```

### 12.2 Health Check Endpoint

```js
// src/routes/healthRoutes.js
import { Router } from 'express';
import { sequelize } from '../config/database.js';

const router = Router();

router.get('/health', async (req, res) => {
  const dbStatus = await sequelize.authenticate().then(() => 'healthy').catch(() => 'unhealthy');
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    db: dbStatus,
    timestamp: new Date(),
  });
});

export default router;
```

### 12.3 S3 Lifecycle Policy (Automatic Cleanup)

```json
{
  "Rules": [
    {
      "Id": "MoveToGlacier",
      "Filter": { "Prefix": "audio/" },
      "Status": "Enabled",
      "Transitions": [
        { "Days": 90,  "StorageClass": "STANDARD_IA" },
        { "Days": 365, "StorageClass": "GLACIER" }
      ],
      "Expiration": { "Days": 2555 }
    }
  ]
}
```

### 12.4 Database Backup (Automated)

```bash
#!/bin/bash
# /usr/local/bin/pg-backup.sh
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > /tmp/backup-$TIMESTAMP.sql.gz
aws s3 cp /tmp/backup-$TIMESTAMP.sql.gz s3://hospital-backups/postgres/
find /tmp -name "*.sql.gz" -mtime +7 -delete
```

```bash
# Cron job (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/pg-backup.sh
```

---

## 13. Post-Deployment Checklist

- [ ]  **Health check** — `GET /api/v1/health` returns 200
- [ ]  **Swagger docs** accessible at `/api-docs`
- [ ]  **Admin seed** — login with admin@hospital.com / Admin@123
- [ ]  **S3 upload** — upload a test image & audio, verify URL is returned
- [ ]  **SSL** — `https://api.hospital.com` works with valid cert
- [ ]  **Nginx** — reverse proxy routing correctly, `client_max_body_size` set
- [ ]  **RDS** — accessible only from EC2 security group (not public)
- [ ]  **Environment variables** — no secrets in code or Docker images
- [ ]  **CI/CD** — push to main triggers test → build → deploy
- [ ]  **Backup** — cron job running, test a restore
- [ ]  **Monitoring** — CloudWatch logs streaming, error alerts configured
- [ ]  **CORS** — restrict to frontend domain in production
- [ ]  **Rate limiting** — apply `express-rate-limit` on auth routes

---

## Summary

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│                    Vercel / S3 + CloudFront              │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────┐
│              Nginx (Reverse Proxy / SSL)                  │
│                   EC2 / Docker                           │
├─────────────────────────────────────────────────────────┤
│              Express API (Node.js)                        │
│              Port 5000 (internal)                        │
├─────────────────────────────────────────────────────────┤
│  ┌───────────┐ ┌──────────┐ ┌───────────────────────┐  │
│  │ Auth/JWT  │ │ RBAC     │ │ Multer → S3           │  │
│  │           │ │ Admin    │ │ (Images, Audio, Docs)  │  │
│  └───────────┘ └──────────┘ └───────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│              PostgreSQL (AWS RDS)                        │
└─────────────────────────────────────────────────────────┘
```
