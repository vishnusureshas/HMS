import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client } from '../config/s3.js';
import { env } from '../config/env.js';

const allowedImages = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const allowedAudio = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];
const allowedDocs = ['application/pdf', 'application/msword', 'text/plain'];

const ALLOWED_TYPES = [...allowedImages, ...allowedAudio, ...allowedDocs];

const storage = multerS3({
  s3: s3Client,
  bucket: env.aws.s3Bucket,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    const prefix = Date.now();
    const sanitized = `${prefix}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    let folder = env.aws.uploadDirs.documents;
    if (file.mimetype.startsWith('image/')) folder = env.aws.uploadDirs.images;
    else if (file.mimetype.startsWith('audio/')) folder = env.aws.uploadDirs.audio;

    cb(null, `${folder}/${sanitized}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export default upload;
