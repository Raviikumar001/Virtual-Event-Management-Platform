/**
 * Build welcome email template.
 * @param {string} userEmail
 * @returns {{ subject: string, text: string, html: string }}
 */
function buildWelcomeTemplate(userEmail) {
  const subject = 'Welcome to Virtual Event Platform';
  const text = `Hello ${userEmail}, your account has been created successfully.`;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>Welcome!</h2>
        <p>Hello <strong>${userEmail}</strong>, your account has been created successfully.</p>
        <p>Start exploring events and register with ease.</p>
      </body>
    </html>
  `;
  return { subject, text, html };
}

/**
 * Build event registration email template.
 * @param {{ title: string, date: string, time: string }} eventInfo
 * @returns {{ subject: string, text: string, html: string }}
 */
function buildEventRegistrationTemplate(eventInfo) {
  const subject = `Registration Confirmed: ${eventInfo.title}`;
  const text = `You have registered for ${eventInfo.title} on ${eventInfo.date} at ${eventInfo.time}.`;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>Registration Confirmed</h2>
        <p>You have registered for <strong>${eventInfo.title}</strong>.</p>
        <p>Date: <strong>${eventInfo.date}</strong> &nbsp; Time: <strong>${eventInfo.time}</strong></p>
        <p>We look forward to seeing you!</p>
      </body>
    </html>
  `;
  return { subject, text, html };
}

module.exports = { buildWelcomeTemplate, buildEventRegistrationTemplate };