/* ==========================================================================
   RoboThink Account — shared auth helper & API client (parent portal)
   ========================================================================== */
const RoboAccount = (() => {
  const STORAGE_KEY = 'robothink_account_session';
  const AUTH_BASE = '/api/auth';

  function getSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function setSession(session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
  }

  async function register(email, password, fullName) {
    const res = await fetch(`${AUTH_BASE}/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    setSession(data);
    return data;
  }

  async function login(email, password) {
    const res = await fetch(`${AUTH_BASE}/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setSession(data);
    return data;
  }

  function logout() {
    clearSession();
    window.location.href = 'login.html';
  }

  async function refresh() {
    const session = getSession();
    if (!session?.refresh_token) throw new Error('No session to refresh');
    const res = await fetch(`${AUTH_BASE}/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Session expired');
    setSession({ ...session, ...data });
    return data;
  }

  /** Authenticated fetch to any /api/* path. Retries once after a token refresh on 401. */
  async function apiFetch(path, options = {}, isRetry = false) {
    const session = getSession();
    if (!session) {
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      throw new Error('Not signed in');
    }

    const res = await fetch(`/api${path}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        ...(options.headers || {}),
      },
    });

    if (res.status === 401 && !isRetry) {
      try {
        await refresh();
        return apiFetch(path, options, true);
      } catch {
        clearSession();
        window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        throw new Error('Session expired');
      }
    }

    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  function requireAuth() {
    if (!getSession()) {
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
  }

  function formatMoney(cents) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  return { getSession, setSession, clearSession, register, login, logout, refresh, apiFetch, requireAuth, formatMoney };
})();
