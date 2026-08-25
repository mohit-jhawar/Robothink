const express = require('express');
const { getServiceClient } = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

// GET /schedule — public
router.get('/', async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('schedule_locations')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ locations: data });
  } catch (err) {
    console.error('[schedule] fetch failed', err);
    res.status(500).json({ error: 'Could not load schedule' });
  }
});

// ---- Admin-only management ----

router.post('/', requireAdmin, async (req, res) => {
  const body = req.body || {};
  if (!body.city || !body.venue || !body.program || !body.day_time || !body.ages) {
    return res.status(400).json({ error: 'city, venue, program, day_time, and ages are required' });
  }
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('schedule_locations').insert({
      city: body.city,
      venue: body.venue,
      program: body.program,
      day_time: body.day_time,
      ages: body.ages,
      sort_order: Number.isFinite(body.sort_order) ? body.sort_order : 0,
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('[schedule] create failed', err);
    res.status(500).json({ error: 'Could not create schedule entry' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const body = req.body || {};
  const updates = {};
  for (const field of ['city', 'venue', 'program', 'day_time', 'ages', 'sort_order']) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  updates.updated_at = new Date().toISOString();
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('schedule_locations').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[schedule] update failed', err);
    res.status(500).json({ error: 'Could not update schedule entry' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('schedule_locations').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    console.error('[schedule] delete failed', err);
    res.status(500).json({ error: 'Could not delete schedule entry' });
  }
});

module.exports = router;
