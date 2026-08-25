/* ==========================================================================
   RoboThink Admin — shared auth helper & API client
   ========================================================================== */
const RoboAdmin = (() => {
  const STORAGE_KEY = 'robothink_admin_session';
  const API_BASE = '/api/admin';

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

  async function login(email, password) {
    const res = await fetch(`${API_BASE}/login`, {
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
    const res = await fetch(`${API_BASE}/refresh`, {
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
      window.location.href = 'login.html';
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
        window.location.href = 'login.html';
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
      window.location.href = 'login.html';
    }
  }

  function formatMoney(cents) {
    return `$${(cents / 100).toFixed(2)}`;
  }

  return { getSession, setSession, clearSession, login, logout, refresh, apiFetch, requireAuth, formatMoney };
})();
