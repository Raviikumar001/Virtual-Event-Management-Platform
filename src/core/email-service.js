const nodemailer = require('nodemailer');
const { loadEnv } = require('./env');

/**
 * Create nodemailer transporter.
 * @returns {import('nodemailer').Transporter}
 */
function createTransporter() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = loadMailerEnv();
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
}

/**
 * Load mailer environment variables.
 * @returns {{ EMAIL_HOST: string, EMAIL_PORT: number, EMAIL_USER: string, EMAIL_PASS: string }}
 */
function loadMailerEnv() {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
  return {
    EMAIL_HOST: String(EMAIL_HOST || 'smtp.ethereal.email'),
    EMAIL_PORT: Number(EMAIL_PORT || 587),
    EMAIL_USER: String(EMAIL_USER || ''),
    EMAIL_PASS: String(EMAIL_PASS || '')
  };
}

/**
 * Send registration email.
 * @param {string} toEmail
 * @param {{ title: string, date: string, time: string }} eventInfo
 * @returns {Promise<void>}
 */
async function sendRegistrationEmail(toEmail, eventInfo) {
  const transporter = createTransporter();
  const subject = `Registration Confirmed: ${eventInfo.title}`;
  const text = `You have registered for ${eventInfo.title} on ${eventInfo.date} at ${eventInfo.time}.`;
  await transporter.sendMail({ from: 'no-reply@virtual-event.local', to: toEmail, subject, text });
}

module.exports = { sendRegistrationEmail };
