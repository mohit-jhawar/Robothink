const { getServiceClient } = require('../db');
const { getStripe } = require('../stripe');
const { sendRegistrationConfirmation, sendRegistrationNotification } = require('../email');

/**
 * A guest registration (no account) just got paid. Flip it to 'paid' and email
 * the family + team. Guarded against Stripe's retries so emails send only once.
 */
async function handlePaidRegistration(supabase, session, registrationId) {
  const { data: reg, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('id', registrationId)
    .single();
  if (error || !reg) {
    console.error('[webhooks] registration not found for', registrationId);
    return;
  }
  if (reg.status === 'paid') return; // already processed on an earlier delivery

  const { error: updateError } = await supabase
    .from('registrations')
    .update({
      status: 'paid',
      stripe_payment_intent_id: session.payment_intent,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reg.id);
  if (updateError) throw updateError;

  const { data: programSession } = await supabase
    .from('program_sessions')
    .select('title')
    .eq('id', reg.session_id)
    .single();
  const title = programSession ? programSession.title : null;

  // Email is best-effort — never fail the webhook (and trigger retries) over it.
  Promise.allSettled([
    sendRegistrationConfirmation(reg, title),
    sendRegistrationNotification(reg, title),
  ]).then((results) => {
    results.forEach((r) => {
      if (r.status === 'rejected') console.error('[webhooks] registration email failed:', r.reason);
    });
  });
}

/**
 * POST /webhooks/stripe — mounted in app.js with express.raw() so req.body
 * is the untouched Buffer Stripe's signature verification requires. Handles
 * the events needed to keep `orders` and `subscriptions` in sync with Stripe.
 */
async function stripeWebhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error('[webhooks] STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).send('Webhook not configured');
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('[webhooks] signature verification failed', err.message);
    return res.status(400).send(`Webhook signature verification failed`);
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata || {};

        if (session.mode === 'payment' && metadata.registration_id) {
          // Guest registration flow (no account) — separate from account orders.
          await handlePaidRegistration(supabase, session, metadata.registration_id);
        } else if (session.mode === 'payment') {
          const { error } = await supabase.from('orders').upsert({
            parent_id: metadata.parent_id,
            plan_id: metadata.plan_id || null,
            child_id: metadata.child_id || null,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            amount_cents: session.amount_total,
            currency: session.currency,
            status: 'paid',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'stripe_checkout_session_id' });
          if (error) throw error;
        } else if (session.mode === 'subscription' && session.subscription) {
          const stripe = getStripe();
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          const { error } = await supabase.from('subscriptions').upsert({
            parent_id: metadata.parent_id,
            plan_id: metadata.plan_id || null,
            child_id: metadata.child_id || null,
            stripe_subscription_id: sub.id,
            stripe_customer_id: sub.customer,
            status: sub.status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'stripe_subscription_id' });
          if (error) throw error;
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const { error } = await supabase.from('subscriptions').update({
          status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id);
        if (error) throw error;
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const { error } = await supabase.from('subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id);
        if (error) throw error;
        break;
      }

      default:
        // Unhandled event types are fine to ignore.
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`[webhooks] failed to process ${event.type}`, err);
    // Non-2xx tells Stripe to retry — appropriate for a transient DB error.
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

module.exports = { stripeWebhookHandler };
