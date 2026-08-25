const express = require('express');
const { getServiceClient } = require('../db');
const { getStripe } = require('../stripe');
const { requireAuth } = require('../auth');

const router = express.Router();

// POST /checkout/session — protected. Creates a Stripe Checkout Session for
// a one-time purchase (payment mode) or a monthly membership (subscription mode).
router.post('/session', requireAuth, async (req, res) => {
  const { plan_id: planId, child_id: childId } = req.body || {};
  if (!planId) return res.status(400).json({ error: 'plan_id is required' });

  try {
    const supabase = getServiceClient();

    const { data: plan, error: planError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .single();
    if (planError || !plan) return res.status(404).json({ error: 'Pricing plan not found' });
    if (!plan.purchasable) return res.status(400).json({ error: 'This plan is not available for online checkout' });

    if (childId) {
      const { data: child, error: childError } = await supabase
        .from('children')
        .select('id')
        .eq('id', childId)
        .eq('parent_id', req.profile.id)
        .single();
      if (childError || !child) return res.status(400).json({ error: 'child_id does not belong to your account' });
    }

    const stripe = getStripe();

    let stripeCustomerId = req.profile.stripe_customer_id;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.profile.email,
        name: req.profile.full_name || undefined,
        metadata: { parent_id: req.profile.id },
      });
      stripeCustomerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', req.profile.id);
    }

    const isRecurring = plan.billing_type === 'recurring';
    const origin = req.headers.origin || process.env.APP_BASE_URL || 'http://localhost:8888';

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: isRecurring ? 'subscription' : 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: plan.price_cents,
          product_data: { name: plan.name },
          ...(isRecurring ? { recurring: { interval: 'month' } } : {}),
        },
      }],
      success_url: `${origin}/account/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/account/checkout-cancel.html`,
      metadata: {
        parent_id: req.profile.id,
        plan_id: plan.id,
        child_id: childId || '',
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] session creation failed', err);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
});

module.exports = router;
