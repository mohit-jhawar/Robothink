const { createClient } = require('@supabase/supabase-js');

let serviceClient = null;
let anonClient = null;

/**
 * Server-side client using the service role key. Bypasses RLS.
 * Use for all data reads/writes performed by the API.
 */
function getServiceClient() {
  if (!serviceClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set');
    }
    serviceClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return serviceClient;
}

/**
 * Anon-key client, used only to verify admin login credentials via
 * Supabase Auth's password grant (auth.signInWithPassword).
 */
function getAnonClient() {
  if (!anonClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL / SUPABASE_ANON_KEY are not set');
    }
    anonClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return anonClient;
}

/** Shared helper: verify email/password via Supabase Auth, return the session. */
async function signInWithPassword(email, password) {
  const supabase = getAnonClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.session) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  return data;
}

/** Shared helper: exchange a refresh_token for a new session. */
async function refreshSession(refreshToken) {
  const supabase = getAnonClient();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data?.session) {
    const err = new Error('Session refresh failed');
    err.status = 401;
    throw err;
  }
  return data;
}

module.exports = { getServiceClient, getAnonClient, signInWithPassword, refreshSession };
