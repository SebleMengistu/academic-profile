import nodemailer from 'nodemailer';
import config from '../config';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user
      ? { user: config.smtp.user, pass: config.smtp.password }
      : undefined,
  });
};

export interface ContactEmailPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const sendContactNotification = async (
  payload: ContactEmailPayload
): Promise<void> => {
  if (!config.smtp.user) {
    console.warn('[Email] SMTP not configured — skipping email send');
    return;
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from: config.smtp.from,
    to: config.adminEmail,
    subject: `New Contact Message: ${payload.subject || 'No subject'}`,
    html: `
      <h2>New Contact Message</h2>
      <p><strong>From:</strong> ${payload.name} (${payload.email})</p>
      <p><strong>Subject:</strong> ${payload.subject || 'N/A'}</p>
      <h3>Message:</h3>
      <p>${payload.message.replace(/\n/g, '<br>')}</p>
    `,
  });
};

export const sendContactAutoReply = async (
  to: string,
  name: string
): Promise<void> => {
  if (!config.smtp.user) return;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject: 'Thank you for your message',
    html: `
      <p>Dear ${name},</p>
      <p>Thank you for contacting me. Your message has been received and I will get back to you as soon as possible.</p>
      <p>Best regards</p>
    `,
  });
};
