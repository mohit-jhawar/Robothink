const express = require('express');
const { getServiceClient } = require('../db');
const { requireAdmin } = require('../auth');
const { seatsLeftForSession, attachSeatsLeft } = require('../lib/seats');

const router = express.Router();
const CATEGORIES = ['camp', 'fll', 'workshop'];

// GET /sessions?category=camp|fll|workshop&theme_slug=...&upcoming=false — public.
// Defaults to only returning sessions that haven't finished yet, oldest first.
router.get('/', async (req, res) => {
  const { category, theme_slug: themeSlug, upcoming } = req.query;
  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'category must be one of: ' + CATEGORIES.join(', ') });
  }
  try {
    const supabase = getServiceClient();
    let query = supabase.from('program_sessions').select('*').order('start_date', { ascending: true });
    if (category) query = query.eq('category', category);
    if (themeSlug) query = query.eq('theme_slug', themeSlug);
    if (upcoming !== 'false') {
      const today = new Date().toISOString().slice(0, 10);
      query = query.or(`end_date.gte.${today},and(end_date.is.null,start_date.gte.${today})`);
    }
    const { data, error } = await query;
    if (error) throw error;

    // Attach live seat counts; if that fails, still return the sessions.
    let sessions = data;
    try {
      sessions = await attachSeatsLeft(data, supabase);
    } catch (seatErr) {
      console.error('[sessions] seat count failed, returning without seats_left', seatErr);
    }
    res.json({ sessions });
  } catch (err) {
    console.error('[sessions] fetch failed', err);
    res.status(500).json({ error: 'Could not load sessions' });
  }
});

// GET /sessions/:id — public. Powers the /programs/:id detail page.
router.get('/:id', async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('program_sessions').select('*').eq('id', req.params.id).single();
    if (error || !data) return res.status(404).json({ error: 'Program not found' });

    let seatsLeft = null;
    try {
      seatsLeft = await seatsLeftForSession(data, supabase);
    } catch (seatErr) {
      console.error('[sessions] single seat count failed', seatErr);
    }
    res.json({ ...data, seats_left: seatsLeft });
  } catch (err) {
    console.error('[sessions] single fetch failed', err);
    res.status(500).json({ error: 'Could not load program' });
  }
});

// ---- Admin-only management ----

router.post('/', requireAdmin, async (req, res) => {
  const body = req.body || {};
  if (!CATEGORIES.includes(body.category) || !body.title || !body.start_date) {
    return res.status(400).json({ error: 'category, title, and start_date are required' });
  }
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('program_sessions').insert({
      category: body.category,
      theme_slug: body.theme_slug || null,
      title: body.title,
      description: body.description || null,
      image_url: body.image_url || null,
      start_date: body.start_date,
      end_date: body.end_date || null,
      city: body.city || null,
      venue: body.venue || null,
      ages: body.ages || null,
      spots_note: body.spots_note || null,
      price_cents: Number.isFinite(body.price_cents) ? body.price_cents : null,
      capacity: Number.isFinite(body.capacity) ? body.capacity : null,
      registration_open: body.registration_open !== false,
      sort_order: Number.isFinite(body.sort_order) ? body.sort_order : 0,
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[sessions] create failed', err);
    res.status(500).json({ error: 'Could not create session' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const body = req.body || {};
  if (body.category !== undefined && !CATEGORIES.includes(body.category)) {
    return res.status(400).json({ error: 'category must be one of: ' + CATEGORIES.join(', ') });
  }
  const updates = {};
  for (const field of ['category', 'theme_slug', 'title', 'description', 'image_url', 'start_date', 'end_date', 'city', 'venue', 'ages', 'spots_note', 'price_cents', 'capacity', 'registration_open', 'sort_order']) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  updates.updated_at = new Date().toISOString();
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('program_sessions').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[sessions] update failed', err);
    res.status(500).json({ error: 'Could not update session' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('program_sessions').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    console.error('[sessions] delete failed', err);
    res.status(500).json({ error: 'Could not delete session' });
  }
});

module.exports = router;
