const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

const LEAD_TYPE_LABELS = {
  trial: 'Free Trial Class Signup',
  inquiry: 'General Inquiry',
  school: 'School Partnership Request',
  fll_team_inquiry: 'FLL Team Registration',
  theme_workshop_inquiry: 'Theme Workshop Inquiry',
};

async function sendViaBrevo({ toEmail, toName, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'RoboThink Collin County';

  if (!apiKey || !senderEmail) {
    console.warn('[email] BREVO_API_KEY or BREVO_SENDER_EMAIL not set — skipping send:', subject);
    return { skipped: true };
  }

  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: toEmail, name: toName || undefined }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo send failed (${res.status}): ${body}`);
  }

  return res.json();
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function detailsToHtml(details) {
  const entries = Object.entries(details || {}).filter(([, v]) => v);
  if (!entries.length) return '';
  return `<ul>${entries.map(([k, v]) => `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</li>`).join('')}</ul>`;
}

/** Notify the RoboThink team that a new lead came in. */
async function sendLeadNotification(lead) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.warn('[email] ADMIN_NOTIFICATION_EMAIL not set — skipping admin notification');
    return { skipped: true };
  }
  const typeLabel = LEAD_TYPE_LABELS[lead.type] || lead.type;
  const html = `
    <h2>New ${escapeHtml(typeLabel)}</h2>
    <p><strong>Name:</strong> ${escapeHtml(lead.name)}<br>
    <strong>Email:</strong> ${escapeHtml(lead.email)}<br>
    <strong>Phone:</strong> ${escapeHtml(lead.phone || '—')}<br>
    <strong>City:</strong> ${escapeHtml(lead.city || '—')}</p>
    ${lead.message ? `<p><strong>Message:</strong><br>${escapeHtml(lead.message)}</p>` : ''}
    ${detailsToHtml(lead.details)}
  `;
  return sendViaBrevo({
    toEmail: adminEmail,
    subject: `New lead: ${typeLabel} — ${lead.name}`,
    html,
  });
}

/** Confirmation email sent back to the person who submitted the form. */
async function sendLeadConfirmation(lead) {
  const typeLabel = LEAD_TYPE_LABELS[lead.type] || lead.type;
  const html = `
    <h2>Thanks for reaching out to RoboThink Collin County!</h2>
    <p>We received your ${escapeHtml(typeLabel).toLowerCase()} and our team will be in touch within one business day.</p>
    <p>— The RoboThink Collin County Team</p>
  `;
  return sendViaBrevo({
    toEmail: lead.email,
    toName: lead.name,
    subject: 'We got your message — RoboThink Collin County',
    html,
  });
}

function formatAmount(cents) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

/** Confirmation email to the parent after a successful paid registration. */
async function sendRegistrationConfirmation(reg, sessionTitle) {
  const html = `
    <h2>You're registered — thank you! 🤖</h2>
    <p>Hi ${escapeHtml(reg.parent_name)}, we've confirmed ${escapeHtml(reg.child_name)}'s spot in
    <strong>${escapeHtml(sessionTitle || 'your RoboThink program')}</strong>.</p>
    <p><strong>Amount paid:</strong> ${escapeHtml(formatAmount(reg.amount_cents))}</p>
    <p>We'll email you any final details before the start date. Questions? Just reply to this email
    or call us at (469) 712-7130.</p>
    <p>— The RoboThink Collin County Team</p>
  `;
  return sendViaBrevo({
    toEmail: reg.parent_email,
    toName: reg.parent_name,
    subject: `Registration confirmed — ${sessionTitle || 'RoboThink Collin County'}`,
    html,
  });
}

/** Notify the RoboThink team that a paid registration came in. */
async function sendRegistrationNotification(reg, sessionTitle) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    console.warn('[email] ADMIN_NOTIFICATION_EMAIL not set — skipping registration notification');
    return { skipped: true };
  }
  const html = `
    <h2>New paid registration</h2>
    <p><strong>Program:</strong> ${escapeHtml(sessionTitle || '—')}<br>
    <strong>Amount:</strong> ${escapeHtml(formatAmount(reg.amount_cents))}<br>
    <strong>Parent:</strong> ${escapeHtml(reg.parent_name)} (${escapeHtml(reg.parent_email)})<br>
    <strong>Phone:</strong> ${escapeHtml(reg.parent_phone || '—')}<br>
    <strong>Child:</strong> ${escapeHtml(reg.child_name)}${reg.child_age ? `, age ${escapeHtml(reg.child_age)}` : ''}<br>
    <strong>City:</strong> ${escapeHtml(reg.city || '—')}</p>
  `;
  return sendViaBrevo({
    toEmail: adminEmail,
    subject: `New registration: ${sessionTitle || 'RoboThink'} — ${reg.child_name}`,
    html,
  });
}

module.exports = {
  sendLeadNotification,
  sendLeadConfirmation,
  sendRegistrationConfirmation,
  sendRegistrationNotification,
};
