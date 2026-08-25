const express = require('express');
const { getServiceClient } = require('../db');
const { getStripe } = require('../stripe');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

/* ---------------- Children ---------------- */

router.get('/children', async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', req.profile.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json({ children: data });
  } catch (err) {
    console.error('[portal] children fetch failed', err);
    res.status(500).json({ error: 'Could not load children' });
  }
});

router.post('/children', async (req, res) => {
  const { name, age, notes } = req.body || {};
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'name is required' });
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('children').insert({
      parent_id: req.profile.id,
      name: String(name).trim(),
      age: Number.isFinite(age) ? age : null,
      notes: notes || null,
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[portal] child create failed', err);
    res.status(500).json({ error: 'Could not add child' });
  }
});

router.delete('/children/:id', async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('children').delete().eq('id', req.params.id).eq('parent_id', req.profile.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    console.error('[portal] child delete failed', err);
    res.status(500).json({ error: 'Could not remove child' });
  }
});

/* ---------------- Orders (one-time purchases) ---------------- */

router.get('/orders', async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, pricing_plans(name), children(name)')
      .eq('parent_id', req.profile.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ orders: data });
  } catch (err) {
    console.error('[portal] orders fetch failed', err);
    res.status(500).json({ error: 'Could not load orders' });
  }
});

/* ---------------- Subscriptions ---------------- */

router.get('/subscriptions', async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, pricing_plans(name), children(name)')
      .eq('parent_id', req.profile.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ subscriptions: data });
  } catch (err) {
    console.error('[portal] subscriptions fetch failed', err);
    res.status(500).json({ error: 'Could not load subscriptions' });
  }
});

router.post('/subscriptions/:id/cancel', async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { data: sub, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', req.params.id)
      .eq('parent_id', req.profile.id)
      .single();
    if (fetchError || !sub) return res.status(404).json({ error: 'Subscription not found' });

    const stripe = getStripe();
    await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });

    const { data: updated, error: updateError } = await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
      .eq('id', sub.id)
      .select()
      .single();
    if (updateError) throw updateError;

    res.json(updated);
  } catch (err) {
    console.error('[portal] subscription cancel failed', err);
    res.status(500).json({ error: 'Could not cancel subscription' });
  }
});

module.exports = router;
