// Admin session client for the React admin dashboard (AdminPage.jsx).
// Mirrors admin/admin.js (the vanilla-JS version) so both stay consistent
// with the same backend contract (/api/admin/*).
const STORAGE_KEY = 'robothink_admin_session';

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
  const res = await fetch('/api/admin/login', {
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
}

async function refresh() {
  const session = getSession();
  if (!session?.refresh_token) throw new Error('No session to refresh');
  const res = await fetch('/api/admin/refresh', {
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
  if (!session) throw new Error('Not signed in');

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && !isRetry) {
    await refresh();
    return apiFetch(path, options, true);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

/** Uploads an image file (multipart) to /api/admin/upload-image. Returns { url }. */
async function uploadImage(file, isRetry = false) {
  const session = getSession();
  if (!session) throw new Error('Not signed in');

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/admin/upload-image', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: formData,
  });

  if (res.status === 401 && !isRetry) {
    await refresh();
    return uploadImage(file, true);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return data;
}

export const RoboAdmin = { getSession, setSession, clearSession, login, logout, refresh, apiFetch, uploadImage };
