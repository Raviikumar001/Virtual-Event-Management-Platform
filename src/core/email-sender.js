const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
const { sendWelcomeEmail: sendWelcomeSMTP, sendRegistrationEmail: sendRegistrationSMTP } = require('./email-service');
const { buildWelcomeTemplate, buildEventRegistrationTemplate } = require('./email-templates');

/**
 * Read env for MailerSend and sender identity.
 * @returns {{ apiKey: string, fromEmail: string, fromName: string }}
 */
function loadMailerEnv() {
  const apiKey = String(process.env.MAILERSEND_API_KEY || process.env.API_KEY || '');
  const fromEmail = String(process.env.EMAIL_FROM || 'no-reply@virtual-event.local');
  const fromName = String(process.env.EMAIL_FROM_NAME || 'Virtual Event');
  return { apiKey, fromEmail, fromName };
}

/**
 * Send using MailerSend API.
 * @param {string} toEmail
 * @param {{ subject: string, text: string, html: string }} template
 * @returns {Promise<{ provider: 'mailersend' }>}
 */
async function sendViaMailerSend(toEmail, template) {
  const { apiKey, fromEmail, fromName } = loadMailerEnv();
  const mailerSend = new MailerSend({ apiKey });
  const sentFrom = new Sender(fromEmail, fromName);
  const recipients = [new Recipient(toEmail, toEmail)];
  const params = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(template.subject)
    .setHtml(template.html)
    .setText(template.text);
  await mailerSend.email.send(params);
  return { provider: 'mailersend' };
}

/**
 * Send welcome email.
 * - If MailerSend API key exists, use MailerSend.
 * - Otherwise, use SMTP (Ethereal fallback in dev).
 * @param {string} toEmail
 * @returns {Promise<{ previewUrl?: string, provider?: 'mailersend' }>}
 */
async function sendWelcomeEmail(toEmail) {
    console.log('sendWelcomeEmail toEmail:', toEmail);
  const { apiKey } = loadMailerEnv();
  console.log('sendWelcomeEmail apiKey:', apiKey);
  const template = buildWelcomeTemplate(toEmail);
  console.log('sendWelcomeEmail template:', template);
  if (apiKey) return sendViaMailerSend(toEmail, template);
  return sendWelcomeSMTP(toEmail);
}

/**
 * Send event registration email.
 * - If MailerSend API key exists, use MailerSend.
 * - Otherwise, use SMTP (Ethereal fallback in dev).
 * @param {string} toEmail
 * @param {{ title: string, date: string, time: string }} eventInfo
 * @returns {Promise<{ previewUrl?: string, provider?: 'mailersend' }>}
 */
async function sendRegistrationEmail(toEmail, eventInfo) {
  const { apiKey } = loadMailerEnv();
  const template = buildEventRegistrationTemplate(eventInfo);
  if (apiKey) return sendViaMailerSend(toEmail, template);
  return sendRegistrationSMTP(toEmail, eventInfo);
}

module.exports = { sendWelcomeEmail, sendRegistrationEmail };
