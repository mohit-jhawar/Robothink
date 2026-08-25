const { getServiceClient } = require('./db');

/**
 * Verifies the Supabase access token sent as `Authorization: Bearer <token>`
 * and attaches the auth user + their `profiles` row to the request.
 * Use for any endpoint that just needs "someone is logged in".
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profileError || !profile) {
      return res.status(401).json({ error: 'No profile found for this account' });
    }

    req.authUser = data.user;
    req.profile = profile;
    next();
  } catch (err) {
    console.error('[auth] token verification failed', err);
    res.status(500).json({ error: 'Auth check failed' });
  }
}

/** Same as requireAuth, but also requires profiles.role === 'admin'. */
function requireAdmin(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.adminUser = req.authUser; // kept for backward compatibility with existing admin routes
    next();
  });
}

module.exports = { requireAuth, requireAdmin };
