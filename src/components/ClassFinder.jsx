import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatSessionDate } from '../lib/formatSessionDate';
import { AGE_GROUPS, matchesAgeGroup } from '../lib/matchAgeGroup';

const CATEGORY_TYPE = { camp: 'Camps', fll: 'FLL', workshop: 'Workshop' };
const PROGRAM_TYPES = ['Robotics', 'Coding', 'Camps', 'FLL', 'Workshop'];

// Classify a weekly class's free-text program name into a filter type.
function classifyWeekly(program) {
  const p = (program || '').toLowerCase();
  if (/cod|game/.test(p)) return 'Coding';
  if (/camp/.test(p)) return 'Camps';
  return 'Robotics'; // robotics, jr. engineering, etc.
}

// Merge the recurring weekly grid (schedule_locations) and the dated one-off
// sessions (program_sessions) into one shape the finder can render + filter.
function normalize(locations, sessions) {
  const weekly = (locations || []).map((l) => ({
    id: `w-${l.id}`,
    kind: 'weekly',
    title: l.program,
    city: l.city || '',
    venue: l.venue || '',
    ages: l.ages || '',
    type: classifyWeekly(l.program),
    when: l.day_time || 'Weekly',
    cta: { label: 'Book Free Trial', to: `/contact?type=trial&program=${encodeURIComponent(l.program || '')}` },
  }));

  const dated = (sessions || []).map((s) => ({
    id: `s-${s.id}`,
    kind: 'dated',
    title: s.title,
    city: s.city || '',
    venue: s.venue || '',
    ages: s.ages || '',
    type: CATEGORY_TYPE[s.category] || 'Workshop',
    when: formatSessionDate(s),
    cta: { label: 'View Details', to: `/programs/${s.id}` },
  }));

  return [...weekly, ...dated];
}

export default function ClassFinder({ compact = false, limit = compact ? 6 : 0 }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [filters, setFilters] = useState({ city: '', ageGroup: '', type: '' });

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/schedule').then((r) => r.json()),
      fetch('/api/sessions').then((r) => r.json()),
    ])
      .then(([sched, sess]) => {
        const locations = sched.status === 'fulfilled' ? sched.value.locations : [];
        const sessions = sess.status === 'fulfilled' ? sess.value.sessions : [];
        setItems(normalize(locations, sessions));
      })
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);

  const cities = useMemo(
    () => [...new Set(items.map((i) => i.city).filter(Boolean))].sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const group = AGE_GROUPS.find((g) => g.id === filters.ageGroup);
    return items.filter((i) => {
      if (filters.city && i.city !== filters.city) return false;
      if (filters.type && i.type !== filters.type) return false;
      if (group && !matchesAgeGroup(i.ages, group)) return false;
      return true;
    });
  }, [items, filters]);

  const shown = limit > 0 ? filtered.slice(0, limit) : filtered;
  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="class-finder">
      <div className="finder-bar">
        <div className="field">
          <label>City</label>
          <select value={filters.city} onChange={setFilter('city')}>
            <option value="">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Age Group</label>
          <select value={filters.ageGroup} onChange={setFilter('ageGroup')}>
            <option value="">All ages</option>
            {AGE_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Program Type</label>
          <select value={filters.type} onChange={setFilter('type')}>
            <option value="">All programs</option>
            {PROGRAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {!loaded ? (
        <div className="finder-results" aria-busy="true" aria-label="Loading classes">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-line sk-sm" style={{ width: '35%' }} />
              <div className="skeleton skeleton-line sk-lg" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line sk-sm" />
              <div className="skeleton skeleton-btn" />
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="finder-empty">
          <p><strong>No classes match those filters yet.</strong></p>
          <p>New sessions open across Collin County regularly — tell us what you're after and we'll find a fit.</p>
          <Link to="/contact?type=trial" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Request a Class →</Link>
        </div>
      ) : (
        <>
          <div className="finder-count">
            {filtered.length} {filtered.length === 1 ? 'class' : 'classes'} found
          </div>
          <div className="finder-results">
            {shown.map((i) => (
              <div key={i.id} className="finder-card">
                <span className={`finder-badge type-${i.type.toLowerCase()}`}>{i.type}</span>
                <h4>{i.title}</h4>
                <div className="finder-meta">
                  <span>🗓️ {i.when}</span>
                  {(i.city || i.venue) && <span>📍 {[i.city, i.venue].filter(Boolean).join(' · ')}</span>}
                  {i.ages && <span>👤 Ages {i.ages}</span>}
                </div>
                <Link to={i.cta.to} className="btn btn-secondary btn-block" style={{ marginTop: '1rem' }}>{i.cta.label}</Link>
              </div>
            ))}
          </div>
          {compact && filtered.length > shown.length && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/parents#finder" className="btn btn-primary">See all {filtered.length} classes →</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
