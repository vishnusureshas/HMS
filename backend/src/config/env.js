import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 5000,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'hospital',
    user: process.env.DB_USER || 'hospital_user',
    password: process.env.DB_PASSWORD || 'hospital_pass',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.AWS_S3_BUCKET || 'hospital-uploads',
    uploadDirs: {
      images: process.env.S3_UPLOAD_DIR_IMAGES || 'images',
      audio: process.env.S3_UPLOAD_DIR_AUDIO || 'audio',
      documents: process.env.S3_UPLOAD_DIR_DOCUMENTS || 'documents',
    },
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },

  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@hospital.com',
  },

  app: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};
