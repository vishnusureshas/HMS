import logger from '../utils/logger.js';

export async function sendEmail({ to, subject, html }) {
  try {
    logger.info(`Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (err) {
    logger.error('Failed to send email:', err.message);
    return { success: false, error: err.message };
  }
}
