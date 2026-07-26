import { MedicalRecord, AuditLog } from '../models/index.js';
import { s3Client } from '../config/s3.js';
import { env } from '../config/env.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import logger from '../utils/logger.js';

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });

    res.json({
      success: true,
      data: {
        url: req.file.location,
        key: req.file.key,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files provided' });
    }

    const files = req.files.map((file) => ({
      url: file.location,
      key: file.key,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({ success: true, data: files });
  } catch (err) {
    next(err);
  }
};

export const uploadMedicalAttachment = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });

    const record = await MedicalRecord.findByPk(req.params.recordId);
    if (!record) return res.status(404).json({ success: false, error: 'Medical record not found' });

    const attachments = record.attachments || [];
    attachments.push({
      url: req.file.location,
      key: req.file.key,
      uploadedAt: new Date(),
    });
    record.attachments = attachments;
    await record.save();

    res.json({ success: true, data: record });
  } catch (err) {
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { key } = req.params;

    await s3Client.send(new DeleteObjectCommand({
      Bucket: env.aws.s3Bucket,
      Key: key,
    }));

    await AuditLog.create({
      userId: req.user.id,
      action: 'DELETE_FILE',
      entity: 'Upload',
      entityId: key,
    });

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (err) {
    next(err);
  }
};
