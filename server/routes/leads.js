const express = require('express');
const { getServiceClient } = require('../db');
const { sendLeadNotification, sendLeadConfirmation } = require('../email');

const router = express.Router();

const ALLOWED_TYPES = ['trial', 'inquiry', 'school', 'fll_team_inquiry', 'theme_workshop_inquiry'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KNOWN_TOP_LEVEL_FIELDS = new Set(['type', 'name', 'email', 'phone', 'city', 'message']);

function validateLeadPayload(body) {
  const errors = [];
  if (!ALLOWED_TYPES.includes(body.type)) errors.push('type must be one of: ' + ALLOWED_TYPES.join(', '));
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) errors.push('name is required');
  if (!body.email || typeof body.email !== 'string' || !EMAIL_RE.test(body.email.trim())) errors.push('a valid email is required');
  return errors;
}

// POST /leads — public endpoint used by the site's forms
router.post('/', async (req, res) => {
  const body = req.body || {};

  // Honeypot: `company` is a hidden field no human sees. If it's filled, it's a
  // bot — pretend everything worked so the bot doesn't learn it was blocked.
  if (body.company) {
    console.warn('[leads] honeypot triggered — dropping submission');
    return res.status(201).json({ id: 'ok' });
  }

  const errors = validateLeadPayload(body);
  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const details = { ...(typeof body.details === 'object' && body.details !== null ? body.details : {}) };
  for (const [key, value] of Object.entries(body)) {
    if (!KNOWN_TOP_LEVEL_FIELDS.has(key) && key !== 'details' && value != null && value !== '') {
      details[key] = value;
    }
  }

  const lead = {
    type: body.type,
    name: String(body.name).trim(),
    email: String(body.email).trim(),
    phone: body.phone ? String(body.phone).trim() : null,
    city: body.city ? String(body.city).trim() : null,
    message: body.message ? String(body.message).trim() : null,
    details,
  };

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('leads').insert(lead).select().single();
    if (error) throw error;

    // Email sending should never block or fail the submission itself.
    Promise.allSettled([
      sendLeadNotification(data),
      sendLeadConfirmation(data),
    ]).then((results) => {
      results.forEach((r) => {
        if (r.status === 'rejected') console.error('[leads] email send failed:', r.reason);
      });
    });

    res.status(201).json({ id: data.id });
  } catch (err) {
    console.error('[leads] insert failed', err);
    res.status(500).json({ error: 'Could not save your submission. Please try again.' });
  }
});

module.exports = router;
