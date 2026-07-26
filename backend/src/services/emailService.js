import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (env.email.host) {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.secure,
      auth: {
        user: env.email.user,
        pass: env.email.pass,
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  try {
    const t = getTransporter();

    if (!t) {
      logger.info(`[Email stub] To: ${to} | Subject: ${subject}`);
      return { success: true };
    }

    await t.sendMail({
      from: env.email.from,
      to,
      subject,
      html,
    });

    logger.info(`Email sent to ${to}: ${subject}`);
    return { success: true };
  } catch (err) {
    logger.error('Failed to send email:', err.message);
    return { success: false, error: err.message };
  }
}

export function sendPasswordResetEmail(to, token) {
  const resetUrl = `${env.app.frontendUrl}/reset-password/${token}`;
  return sendEmail({
    to,
    subject: 'Password Reset - Hospital Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Password Reset</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="color: #999; font-size: 12px;">Hospital Management System</p>
      </div>
    `,
  });
}
