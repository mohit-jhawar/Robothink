const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const { getServiceClient, signInWithPassword, refreshSession } = require('../db');
const { requireAdmin } = require('../auth');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

// POST /admin/login — public. Verifies credentials via Supabase Auth, and
// confirms the account's profile is role=admin before handing back a session.
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  try {
    const { session, user } = await signInWithPassword(email, password);
    const supabase = getServiceClient();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'This account does not have admin access' });
    }
    res.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    if (err.status === 401) return res.status(401).json({ error: err.message || 'Invalid email or password' });
    console.error('[admin] login failed', err);
    res.status(err.status || 500).json({ error: err.message || 'Login failed' });
  }
});

// POST /admin/refresh — public, exchanges a refresh_token for a new session
router.post('/refresh', async (req, res) => {
  const { refresh_token: refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'refresh_token is required' });
  try {
    const { session } = await refreshSession(refreshToken);
    res.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
    });
  } catch (err) {
    if (err.status === 401) return res.status(401).json({ error: err.message });
    console.error('[admin] refresh failed', err);
    res.status(500).json({ error: 'Session refresh failed' });
  }
});

// GET /admin/me — protected, sanity check for the dashboard on load
router.get('/me', requireAdmin, (req, res) => {
  res.json({ id: req.adminUser.id, email: req.adminUser.email });
});

// POST /admin/upload-image — protected. Uploads a photo (multipart field
// "image") to the "program-images" Supabase Storage bucket and returns its
// public URL, for use as program_sessions.image_url.
router.post('/upload-image', requireAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image file is required' });
  try {
    const supabase = getServiceClient();
    const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('program-images')
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('program-images').getPublicUrl(path);
    res.status(201).json({ url: data.publicUrl });
  } catch (err) {
    console.error('[admin] image upload failed', err);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

// GET /admin/leads — protected, optional ?type= & ?status= filters
router.get('/leads', requireAdmin, async (req, res) => {
  try {
    const supabase = getServiceClient();
    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (req.query.type) query = query.eq('type', req.query.type);
    if (req.query.status) query = query.eq('status', req.query.status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ leads: data });
  } catch (err) {
    console.error('[admin] leads fetch failed', err);
    res.status(500).json({ error: 'Could not load leads' });
  }
});

// PATCH /admin/leads/:id — protected, update status
const ALLOWED_STATUSES = ['new', 'contacted', 'enrolled', 'closed'];
router.patch('/leads/:id', requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'status must be one of: ' + ALLOWED_STATUSES.join(', ') });
  }
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.from('leads').update({ status }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[admin] lead update failed', err);
    res.status(500).json({ error: 'Could not update lead' });
  }
});

// DELETE /admin/leads/:id — protected, delete lead
router.delete('/leads/:id', requireAdmin, async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('leads').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    console.error('[admin] lead delete failed', err);
    res.status(500).json({ error: 'Could not delete lead' });
  }
});

module.exports = router;
