const { getServiceClient } = require('../db');

// A pending registration soft-holds its seat for this long so two parents can't
// both grab the last spot while one is mid-checkout. After it expires, the seat
// frees up again (the abandoned pending row is simply ignored, not deleted).
const PENDING_HOLD_MINUTES = 15;

function holdCutoffIso() {
  return new Date(Date.now() - PENDING_HOLD_MINUTES * 60000).toISOString();
}

// Does a registration row currently occupy a seat? Paid always counts; pending
// only counts while still inside its hold window.
function occupiesSeat(reg, cutoff) {
  if (reg.status === 'paid') return true;
  return reg.status === 'pending' && reg.created_at >= cutoff;
}

/**
 * Seats left for one session. Returns null when capacity isn't tracked.
 * @param {{ id: string, capacity: number|null }} session
 */
async function seatsLeftForSession(session, supabase) {
  if (session.capacity == null) return null;
  const client = supabase || getServiceClient();
  const { data, error } = await client
    .from('registrations')
    .select('status, created_at')
    .eq('session_id', session.id)
    .in('status', ['paid', 'pending']);
  if (error) throw error;

  const cutoff = holdCutoffIso();
  const taken = (data || []).filter((r) => occupiesSeat(r, cutoff)).length;
  return Math.max(0, session.capacity - taken);
}

/**
 * Attach a `seats_left` field to each session in a list using a single query
 * (avoids N+1). Sessions without a capacity get `seats_left: null`.
 */
async function attachSeatsLeft(sessions, supabase) {
  const tracked = (sessions || []).filter((s) => s.capacity != null);
  if (!tracked.length) return (sessions || []).map((s) => ({ ...s, seats_left: null }));

  const client = supabase || getServiceClient();
  const ids = tracked.map((s) => s.id);
  const { data, error } = await client
    .from('registrations')
    .select('session_id, status, created_at')
    .in('session_id', ids)
    .in('status', ['paid', 'pending']);
  if (error) throw error;

  const cutoff = holdCutoffIso();
  const counts = {};
  for (const r of data || []) {
    if (occupiesSeat(r, cutoff)) counts[r.session_id] = (counts[r.session_id] || 0) + 1;
  }

  return sessions.map((s) =>
    s.capacity == null
      ? { ...s, seats_left: null }
      : { ...s, seats_left: Math.max(0, s.capacity - (counts[s.id] || 0)) },
  );
}

module.exports = { seatsLeftForSession, attachSeatsLeft, PENDING_HOLD_MINUTES };
