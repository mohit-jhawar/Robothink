const express = require('express');
const { getServiceClient, signInWithPassword, refreshSession } = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /auth/register — public. Creates a Supabase Auth user + a `parent` profile.
router.post('/register', async (req, res) => {
  const { email, password, full_name: fullName } = req.body || {};
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  if (!password || String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const supabase = getServiceClient();

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: String(email).trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || null },
    });
    if (createError) {
      if (/already registered|already exists/i.test(createError.message)) {
        return res.status(409).json({ error: createError.message });
      }
      if (createError.status && createError.status < 500) {
        return res.status(createError.status).json({ error: createError.message });
      }
      console.error('[auth] createUser failed', createError);
      return res.status(500).json({ error: 'Registration failed. Please try again.' });
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: created.user.id,
      email: created.user.email,
      full_name: fullName || null,
      role: 'parent',
    });
    if (profileError) {
      console.error('[auth] profile insert failed after user creation', profileError);
      return res.status(500).json({ error: 'Account created but profile setup failed. Please contact support.' });
    }

    const { session, user } = await signInWithPassword(email, password);
    res.status(201).json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error('[auth] register failed', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /auth/login — public. Any role may use this (parents use it day to day).
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  try {
    const { session, user } = await signInWithPassword(email, password);
    res.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    if (err.status === 401) return res.status(401).json({ error: err.message });
    console.error('[auth] login failed', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/refresh — public
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
    console.error('[auth] refresh failed', err);
    res.status(500).json({ error: 'Session refresh failed' });
  }
});

// GET /auth/me — protected, any logged-in user
router.get('/me', requireAuth, (req, res) => {
  res.json({ id: req.profile.id, email: req.profile.email, full_name: req.profile.full_name, role: req.profile.role });
});

module.exports = router;
