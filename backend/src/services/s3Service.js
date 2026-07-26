import { s3Client } from '../config/s3.js';
import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

export async function getSignedFileUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: env.aws.s3Bucket,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (err) {
    logger.error('Failed to generate signed URL:', err.message);
    return null;
  }
}

export async function deleteFile(key) {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: env.aws.s3Bucket,
      Key: key,
    }));
    return true;
  } catch (err) {
    logger.error('Failed to delete S3 file:', err.message);
    return false;
  }
}
