const express = require('express');
const { getServiceClient } = require('../db');
const { getStripe } = require('../stripe');
const { seatsLeftForSession } = require('../lib/seats');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body) {
  const errors = [];
  if (!body.session_id) errors.push('session_id is required');
  if (!body.parent_name || !String(body.parent_name).trim()) errors.push('parent_name is required');
  if (!body.parent_email || !EMAIL_RE.test(String(body.parent_email).trim())) errors.push('a valid parent_email is required');
  if (!body.child_name || !String(body.child_name).trim()) errors.push('child_name is required');
  return errors;
}

// POST /register — public guest checkout. Creates a pending registration and a
// Stripe Checkout Session (payment mode, no account). The Stripe webhook flips
// the row to 'paid' and sends the confirmation email.
router.post('/', async (req, res) => {
  const body = req.body || {};

  // Honeypot (see leads.js). Reject bots without creating a Stripe session.
  if (body.company) {
    console.warn('[register] honeypot triggered — dropping submission');
    return res.status(400).json({ error: 'Unable to process this request.' });
  }

  const errors = validate(body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  try {
    const supabase = getServiceClient();

    const { data: session, error: sessionError } = await supabase
      .from('program_sessions')
      .select('*')
      .eq('id', body.session_id)
      .single();
    if (sessionError || !session) return res.status(404).json({ error: 'Program session not found' });

    if (session.registration_open === false || session.price_cents == null) {
      return res.status(400).json({ error: "This session isn't open for online registration." });
    }

    if (session.capacity != null) {
      const left = await seatsLeftForSession(session, supabase);
      if (left <= 0) return res.status(409).json({ error: 'This session is full.' });
    }

    const childAge = Number.parseInt(body.child_age, 10);
    const { data: reg, error: regError } = await supabase
      .from('registrations')
      .insert({
        session_id: session.id,
        parent_name: String(body.parent_name).trim(),
        parent_email: String(body.parent_email).trim(),
        parent_phone: body.parent_phone ? String(body.parent_phone).trim() : null,
        child_name: String(body.child_name).trim(),
        child_age: Number.isFinite(childAge) ? childAge : null,
        city: body.city ? String(body.city).trim() : session.city || null,
        amount_cents: session.price_cents,
        currency: 'usd',
        status: 'pending',
      })
      .select()
      .single();
    if (regError) throw regError;

    const stripe = getStripe();
    const origin = req.headers.origin || process.env.APP_BASE_URL || 'http://localhost:8888';

    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: reg.parent_email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: session.price_cents,
          product_data: {
            name: session.title,
            description: [session.city, session.venue].filter(Boolean).join(' · ') || undefined,
          },
        },
      }],
      success_url: `${origin}/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/register/cancel`,
      metadata: { registration_id: reg.id, session_id: session.id },
    });

    const { error: updateError } = await supabase
      .from('registrations')
      .update({ stripe_checkout_session_id: checkout.id, updated_at: new Date().toISOString() })
      .eq('id', reg.id);
    if (updateError) throw updateError;

    res.json({ url: checkout.url });
  } catch (err) {
    console.error('[register] failed to start registration', err);
    res.status(500).json({ error: 'Could not start registration. Please try again.' });
  }
});

// GET /register/status/:checkoutSessionId — lightweight poll for the success
// page (the webhook may land a moment after Stripe redirects the parent back).
router.get('/status/:checkoutSessionId', async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('registrations')
      .select('status, child_name, session_id')
      .eq('stripe_checkout_session_id', req.params.checkoutSessionId)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Registration not found' });

    let sessionTitle = null;
    const { data: session } = await supabase
      .from('program_sessions')
      .select('title')
      .eq('id', data.session_id)
      .single();
    if (session) sessionTitle = session.title;

    res.json({ status: data.status, child_name: data.child_name, session_title: sessionTitle });
  } catch (err) {
    console.error('[register] status lookup failed', err);
    res.status(500).json({ error: 'Could not look up registration' });
  }
});

module.exports = router;
