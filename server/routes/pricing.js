const express = require('express');
const { getServiceClient } = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();
const CATEGORIES = ['membership', 'party'];

// GET /pricing?category=membership|party — public
router.get('/', async (req, res) => {
  const category = CATEGORIES.includes(req.query.category) ? req.query.category : 'membership';
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('category', category)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ plans: data });
  } catch (err) {
    console.error('[pricing] fetch failed', err);
    res.status(500).json({ error: 'Could not load pricing' });
  }
});

// GET /pricing/:id — public, used by the checkout page to show what's being purchased
router.get('/:id', async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('pricing_plans').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Pricing plan not found' });
    res.json(data);
  } catch (err) {
    console.error('[pricing] single fetch failed', err);
    res.status(500).json({ error: 'Could not load pricing plan' });
  }
});

// ---- Admin-only management ----

router.post('/', requireAdmin, async (req, res) => {
  const body = req.body || {};
  if (!body.name || !CATEGORIES.includes(body.category) || typeof body.price_cents !== 'number') {
    return res.status(400).json({ error: 'name, category, and price_cents (integer, cents) are required' });
  }
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('pricing_plans').insert({
      category: body.category,
      name: body.name,
      price_cents: body.price_cents,
      billing_period: body.billing_period || 'mo',
      price_note: body.price_note || null,
      features: Array.isArray(body.features) ? body.features : [],
      featured: !!body.featured,
      cta_label: body.cta_label || 'Get Started',
      cta_href: body.cta_href || 'contact.html',
      sort_order: Number.isFinite(body.sort_order) ? body.sort_order : 0,
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[pricing] create failed', err);
    res.status(500).json({ error: 'Could not create pricing plan' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const body = req.body || {};
  const updates = {};
  for (const field of ['category', 'name', 'price_cents', 'billing_period', 'price_note', 'features', 'featured', 'cta_label', 'cta_href', 'sort_order']) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  updates.updated_at = new Date().toISOString();
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('pricing_plans').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[pricing] update failed', err);
    res.status(500).json({ error: 'Could not update pricing plan' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('pricing_plans').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    console.error('[pricing] delete failed', err);
    res.status(500).json({ error: 'Could not delete pricing plan' });
  }
});

module.exports = router;
