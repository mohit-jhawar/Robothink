import React, { useState, useEffect, useMemo } from 'react';
import { RoboAdmin } from '../lib/adminApi';
import { useDocumentMeta } from '../lib/useDocumentMeta';

const SESSION_CATEGORIES = [
  { value: 'camp', label: 'Camp' },
  { value: 'fll', label: 'FLL' },
  { value: 'workshop', label: 'Theme Workshop' },
];

const THEME_SLUGS = [
  'battle-robots', 'amusement-park', 'expedition-mars', 'robopetz',
  'demolition-robots', 'engineer-race-cars', 'cosmic-space-bots', 'under-the-sea',
];

const LEAD_STATUSES = ['new', 'contacted', 'enrolled', 'closed'];

const STANDARD_PERIODS = [
  { value: 'mo', label: 'Monthly (/mo)' },
  { value: 'wk', label: 'Weekly (/week)' },
  { value: 'yr', label: 'Annually (/year)' },
  { value: 'cycle', label: '8-Week Cycle (/cycle)' },
  { value: 'party', label: 'Per Birthday Party (/party)' },
  { value: 'day', label: 'Per Day (/day)' },
  { value: 'custom', label: '✨ Custom Creation...' },
];

const emptySessionForm = () => ({
  category: 'camp', theme_slug: '', title: '', description: '', image_url: '',
  start_date: '', end_date: '', city: '', venue: '', ages: '', spots_note: '',
});

const emptyScheduleForm = () => ({
  city: '', venue: '', program: '', day_time: '', ages: '', sort_order: 0,
});

const emptyPricingForm = () => ({
  category: 'membership', name: '', price_dollars: '', billing_period: 'mo',
  price_note: '', features_text: '', featured: false, cta_label: 'Get Started', sort_order: 0,
});

export default function AdminPage() {
  useDocumentMeta({ title: 'Admin Dashboard', noindex: true });
  const [session, setSessionState] = useState(RoboAdmin.getSession());
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('leads'); // 'leads' | 'locations' | 'sessions' | 'pricing'

  // Leads state
  const [leads, setLeads] = useState([]);
  const [leadsError, setLeadsError] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('');

  // Weekly Schedules state
  const [schedules, setSchedules] = useState([]);
  const [schedulesError, setSchedulesError] = useState('');
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm());
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  // Dated Program Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsError, setSessionsError] = useState('');
  const [sessionForm, setSessionForm] = useState(emptySessionForm());
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Pricing Plans state
  const [pricingPlans, setPricingPlans] = useState([]);
  const [pricingError, setPricingError] = useState('');
  const [pricingForm, setPricingForm] = useState(emptyPricingForm());
  const [editingPricingId, setEditingPricingId] = useState(null);
  const [periodSelection, setPeriodSelection] = useState('mo');
  const [customPeriodInput, setCustomPeriodInput] = useState('');

  // Universal Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title, type: 'lead' | 'schedule' | 'session' | 'pricing' }
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!session) return;
    loadLeads();
    loadSchedules();
    loadSessions();
    loadPricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function loadLeads() {
    try {
      const data = await RoboAdmin.apiFetch('/admin/leads');
      setLeads(data.leads || []);
    } catch (err) {
      setLeadsError(err.message);
    }
  }

  async function loadSchedules() {
    try {
      const data = await RoboAdmin.apiFetch('/schedule');
      setSchedules(data.locations || []);
    } catch (err) {
      setSchedulesError(err.message);
    }
  }

  async function loadSessions() {
    try {
      const data = await RoboAdmin.apiFetch('/sessions?upcoming=false');
      setSessions(data.sessions || []);
    } catch (err) {
      setSessionsError(err.message);
    }
  }

  async function loadPricing() {
    try {
      const [membership, party] = await Promise.all([
        RoboAdmin.apiFetch('/pricing?category=membership'),
        RoboAdmin.apiFetch('/pricing?category=party'),
      ]);
      const combined = [...(membership.plans || []), ...(party.plans || [])];
      setPricingPlans(combined);
    } catch (err) {
      setPricingError(err.message);
    }
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      await RoboAdmin.login(adminEmail, adminPassword);
      setSessionState(RoboAdmin.getSession());
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    RoboAdmin.logout();
    setSessionState(null);
    setLeads([]);
    setSchedules([]);
    setSessions([]);
    setPricingPlans([]);
    setEditingSessionId(null);
    setEditingScheduleId(null);
    setEditingPricingId(null);
  };

  /* ---------------- Leads Management ---------------- */
  async function updateLeadStatus(id, newStatus) {
    try {
      await RoboAdmin.apiFetch(`/admin/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
    } catch (err) {
      setLeadsError(err.message);
    }
  }

  function exportLeadsCSV() {
    if (!leads.length) return;
    const headers = ['Submitted At', 'Type', 'Name', 'Email', 'Phone', 'City', 'Status', 'Message', 'Details'];
    const rows = leads.map((l) => [
      new Date(l.created_at).toLocaleString(),
      l.type || '',
      l.name || '',
      l.email || '',
      l.phone || '',
      l.city || '',
      l.status || 'new',
      (l.message || '').replace(/"/g, '""'),
      JSON.stringify(l.details || {}).replace(/"/g, '""'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((field) => `"${field}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `robothink-leads-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (leadStatusFilter && l.status !== leadStatusFilter) return false;
      if (leadSearch) {
        const q = leadSearch.toLowerCase();
        const matchName = (l.name || '').toLowerCase().includes(q);
        const matchEmail = (l.email || '').toLowerCase().includes(q);
        const matchCity = (l.city || '').toLowerCase().includes(q);
        const matchType = (l.type || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchCity && !matchType) return false;
      }
      return true;
    });
  }, [leads, leadSearch, leadStatusFilter]);

  /* ---------------- Weekly Schedule Handlers ---------------- */
  function handleScheduleFieldChange(e) {
    const { name, value } = e.target;
    setScheduleForm((prev) => ({
      ...prev,
      [name]: name === 'sort_order' ? (parseInt(value, 10) || 0) : value,
    }));
  }

  async function handleScheduleSubmit(e) {
    e.preventDefault();
    setSchedulesError('');
    try {
      if (editingScheduleId) {
        await RoboAdmin.apiFetch(`/schedule/${editingScheduleId}`, {
          method: 'PUT',
          body: JSON.stringify(scheduleForm),
        });
      } else {
        await RoboAdmin.apiFetch('/schedule', {
          method: 'POST',
          body: JSON.stringify(scheduleForm),
        });
      }
      setScheduleForm(emptyScheduleForm());
      setEditingScheduleId(null);
      loadSchedules();
    } catch (err) {
      setSchedulesError(err.message);
    }
  }

  function startEditSchedule(loc) {
    setEditingScheduleId(loc.id);
    setScheduleForm({
      city: loc.city || '',
      venue: loc.venue || '',
      program: loc.program || '',
      day_time: loc.day_time || '',
      ages: loc.ages || '',
      sort_order: loc.sort_order ?? 0,
    });
  }

  function cancelEditSchedule() {
    setEditingScheduleId(null);
    setScheduleForm(emptyScheduleForm());
  }

  /* ---------------- Session Handlers ---------------- */
  function handleSessionFieldChange(e) {
    setSessionForm({ ...sessionForm, [e.target.name]: e.target.value });
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploadingImage(true);
    try {
      const { url } = await RoboAdmin.uploadImage(file);
      setSessionForm((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  async function handleSessionSubmit(e) {
    e.preventDefault();
    setSessionsError('');
    const payload = {
      ...sessionForm,
      theme_slug: sessionForm.category === 'workshop' ? (sessionForm.theme_slug || null) : null,
      end_date: sessionForm.end_date || null,
    };
    try {
      if (editingSessionId) {
        await RoboAdmin.apiFetch(`/sessions/${editingSessionId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await RoboAdmin.apiFetch('/sessions', { method: 'POST', body: JSON.stringify(payload) });
      }
      setSessionForm(emptySessionForm());
      setEditingSessionId(null);
      setUploadError('');
      loadSessions();
    } catch (err) {
      setSessionsError(err.message);
    }
  }

  function startEditSession(s) {
    setEditingSessionId(s.id);
    setSessionForm({
      category: s.category,
      theme_slug: s.theme_slug || '',
      title: s.title,
      description: s.description || '',
      image_url: s.image_url || '',
      start_date: s.start_date ? s.start_date.slice(0, 10) : '',
      end_date: s.end_date ? s.end_date.slice(0, 10) : '',
      city: s.city || '',
      venue: s.venue || '',
      ages: s.ages || '',
      spots_note: s.spots_note || '',
    });
  }

  function cancelEditSession() {
    setEditingSessionId(null);
    setSessionForm(emptySessionForm());
    setUploadError('');
  }

  /* ---------------- Pricing Handlers ---------------- */
  function handlePricingFieldChange(e) {
    const { name, value, type, checked } = e.target;
    setPricingForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'sort_order' ? (parseInt(value, 10) || 0) : value),
    }));
  }

  async function handlePricingSubmit(e) {
    e.preventDefault();
    setPricingError('');
    const priceCents = Math.round(parseFloat(pricingForm.price_dollars || 0) * 100);
    const featuresList = (pricingForm.features_text || '')
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      category: pricingForm.category,
      name: pricingForm.name,
      price_cents: priceCents,
      billing_period: pricingForm.billing_period,
      price_note: pricingForm.price_note || null,
      features: featuresList,
      featured: !!pricingForm.featured,
      cta_label: pricingForm.cta_label || 'Get Started',
      sort_order: pricingForm.sort_order ?? 0,
    };

    try {
      if (editingPricingId) {
        await RoboAdmin.apiFetch(`/pricing/${editingPricingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await RoboAdmin.apiFetch('/pricing', { method: 'POST', body: JSON.stringify(payload) });
      }
      setPricingForm(emptyPricingForm());
      setEditingPricingId(null);
      loadPricing();
    } catch (err) {
      setPricingError(err.message);
    }
  }

  function startEditPricing(plan) {
    setEditingPricingId(plan.id);
    const isStandard = STANDARD_PERIODS.some((p) => p.value !== 'custom' && p.value === plan.billing_period);
    if (isStandard) {
      setPeriodSelection(plan.billing_period || 'mo');
      setCustomPeriodInput('');
    } else {
      setPeriodSelection('custom');
      setCustomPeriodInput(plan.billing_period || '');
    }
    setPricingForm({
      category: plan.category || 'membership',
      name: plan.name || '',
      price_dollars: ((plan.price_cents || 0) / 100).toFixed(2),
      billing_period: plan.billing_period || 'mo',
      price_note: plan.price_note || '',
      features_text: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      featured: !!plan.featured,
      cta_label: plan.cta_label || 'Get Started',
      sort_order: plan.sort_order ?? 0,
    });
  }

  function cancelEditPricing() {
    setEditingPricingId(null);
    setPeriodSelection('mo');
    setCustomPeriodInput('');
    setPricingForm(emptyPricingForm());
  }

  /* ---------------- Universal Delete Dialog Handlers ---------------- */
  function promptDelete(target) {
    setDeleteTarget(target); // { id, title, type: 'lead' | 'schedule' | 'session' | 'pricing' }
  }

  function cancelDelete() {
    if (isDeleting) return;
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'lead') {
        setLeadsError('');
        await RoboAdmin.apiFetch(`/admin/leads/${deleteTarget.id}`, { method: 'DELETE' });
        loadLeads();
      } else if (deleteTarget.type === 'schedule') {
        setSchedulesError('');
        await RoboAdmin.apiFetch(`/schedule/${deleteTarget.id}`, { method: 'DELETE' });
        loadSchedules();
      } else if (deleteTarget.type === 'pricing') {
        setPricingError('');
        await RoboAdmin.apiFetch(`/pricing/${deleteTarget.id}`, { method: 'DELETE' });
        loadPricing();
      } else {
        setSessionsError('');
        await RoboAdmin.apiFetch(`/sessions/${deleteTarget.id}`, { method: 'DELETE' });
        loadSessions();
      }
      setDeleteTarget(null);
    } catch (err) {
      if (deleteTarget.type === 'lead') setLeadsError(err.message);
      else if (deleteTarget.type === 'schedule') setSchedulesError(err.message);
      else if (deleteTarget.type === 'pricing') setPricingError(err.message);
      else setSessionsError(err.message);
    } finally {
      setIsDeleting(false);
    }
  }

  if (!session) {
    return (
      <div className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '440px' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Admin Portal Sign In</h2>
            <form onSubmit={handleAdminLogin}>
              <div className="field">
                <label>Admin Email</label>
                <input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              </div>
              <div className="field">
                <label>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    style={{ paddingRight: '42px', width: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {loginError && <p style={{ color: '#DC2626', fontSize: '0.9rem', marginBottom: '1rem' }}>{loginError}</p>}
              <button type="submit" className="btn btn-primary btn-block" disabled={loggingIn}>
                {loggingIn ? 'Signing in…' : 'Sign In to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ minHeight: '75vh', padding: '2.5rem 0 5rem' }}>
      {/* ── Scoped Styling for Table Actions ── */}
      <style>{`
        .table-actions-cell {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          white-space: nowrap;
        }
        .btn-table-edit {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 13px;
          font-size: 0.82rem;
          font-weight: 600;
          border-radius: 7px;
          background: #f0f9ff;
          color: #0284c7;
          border: 1px solid #bae6fd;
          cursor: pointer;
          transition: all 0.18s ease;
          line-height: 1.2;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .btn-table-edit:hover {
          background: #0284c7;
          color: #ffffff;
          border-color: #0284c7;
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(2, 132, 199, 0.25);
        }
        .btn-table-delete {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 13px;
          font-size: 0.82rem;
          font-weight: 600;
          border-radius: 7px;
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
          cursor: pointer;
          transition: all 0.18s ease;
          line-height: 1.2;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .btn-table-delete:hover {
          background: #dc2626;
          color: #ffffff;
          border-color: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(220, 38, 38, 0.25);
        }
      `}</style>

      <div className="container" style={{ maxWidth: '1080px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.85rem' }}>RoboThink Admin Dashboard</h2>
            <p style={{ margin: 0, color: 'var(--color-slate-light)', fontSize: '0.95rem' }}>
              Full management control over leads, classes, sessions, and pricing packages.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Log Out Admin
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { id: 'leads', label: '📋 Lead Inquiries', count: leads.length },
            { id: 'locations', label: '📍 Weekly Classes', count: schedules.length },
            { id: 'sessions', label: '📅 Program Dates (Camps/FLL)', count: sessions.length },
            { id: 'pricing', label: '💳 Pricing & Packages', count: pricingPlans.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #0284C7' : '3px solid transparent',
                color: activeTab === tab.id ? '#0284C7' : '#64748B',
                fontWeight: activeTab === tab.id ? 700 : 600,
                fontSize: '0.98rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '-2px',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
              <span style={{
                background: activeTab === tab.id ? '#E0F2FE' : '#F1F5F9',
                color: activeTab === tab.id ? '#0284C7' : '#475569',
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 700,
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ════════ TAB 1: LEADS & INQUIRIES ════════ */}
        {activeTab === 'leads' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>Parent Submissions &amp; Inquiries</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-slate-light)', fontSize: '0.9rem' }}>
                  Real-time trial signups, contact requests, and school partnership leads.
                </p>
              </div>
              <button
                type="button"
                onClick={exportLeadsCSV}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', padding: '0.55rem 1.1rem' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Download Leads (CSV)
              </button>
            </div>

            {leadsError && <p style={{ color: '#DC2626', marginBottom: '1rem' }}>{leadsError}</p>}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by name, email, city..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                style={{ maxWidth: '300px', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
              />
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                style={{ maxWidth: '200px', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
              >
                <option value="">All Statuses</option>
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>Status: {s.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Parent / Contact</th>
                    <th>City</th>
                    <th>Message / Details</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No lead submissions matching filters.</td></tr>
                  ) : filteredLeads.map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontSize: '0.85rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {new Date(l.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: l.type === 'trial' ? '#DCFCE7' : '#E0F2FE',
                          color: l.type === 'trial' ? '#166534' : '#0369A1',
                          textTransform: 'uppercase',
                        }}>
                          {l.type}
                        </span>
                      </td>
                      <td>
                        <strong>{l.name}</strong>
                        <div style={{ fontSize: '0.85rem', color: '#0284C7' }}>{l.email}</div>
                        {l.phone && <div style={{ fontSize: '0.82rem', color: '#64748B' }}>{l.phone}</div>}
                      </td>
                      <td>{l.city || '—'}</td>
                      <td style={{ fontSize: '0.88rem', maxWidth: '240px' }}>
                        {l.message && <div style={{ marginBottom: '4px' }}>{l.message}</div>}
                        {l.details && Object.keys(l.details).length > 0 && (
                          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            {Object.entries(l.details).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                          </div>
                        )}
                      </td>
                      <td>
                        <select
                          value={l.status || 'new'}
                          onChange={(e) => updateLeadStatus(l.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            background: l.status === 'enrolled' ? '#DCFCE7' : (l.status === 'contacted' ? '#FEF9C3' : '#FFFFFF'),
                            color: '#0F172A',
                          }}
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.toUpperCase()}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn-table-delete"
                          onClick={() => promptDelete({ id: l.id, title: `Lead from ${l.name} (${l.email})`, type: 'lead' })}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════ TAB 2: WEEKLY CLASS LOCATIONS ════════ */}
        {activeTab === 'locations' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Weekly Class Locations (Classes Near You)</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-slate-light)', fontSize: '0.9rem' }}>
                Powers the <strong>"Classes Near You in Collin County"</strong> finder on the Home Page and program pages.
              </p>
            </div>

            {schedulesError && <p style={{ color: '#DC2626', marginBottom: '1rem' }}>{schedulesError}</p>}

            <form onSubmit={handleScheduleSubmit} style={{ marginBottom: '2rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#0F172A' }}>
                {editingScheduleId ? '✏️ Edit Class Location' : '➕ Add New Class Location'}
              </h4>
              <div className="form-row">
                <div className="field">
                  <label>City</label>
                  <input type="text" name="city" required value={scheduleForm.city} onChange={handleScheduleFieldChange} placeholder="e.g. Allen, McKinney, Prosper" />
                </div>
                <div className="field">
                  <label>Venue / Building Name</label>
                  <input type="text" name="venue" required value={scheduleForm.venue} onChange={handleScheduleFieldChange} placeholder="e.g. Allen Community Center" />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Program Name</label>
                  <input type="text" name="program" required value={scheduleForm.program} onChange={handleScheduleFieldChange} placeholder="e.g. Robotics, Coding & Game Design, Jr. Engineering" />
                </div>
                <div className="field">
                  <label>Day &amp; Time</label>
                  <input type="text" name="day_time" required value={scheduleForm.day_time} onChange={handleScheduleFieldChange} placeholder="e.g. Tuesdays · 4:30–5:30 PM" />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Age Range</label>
                  <input type="text" name="ages" required value={scheduleForm.ages} onChange={handleScheduleFieldChange} placeholder="e.g. 7–10 or 8–12" />
                </div>
                <div className="field">
                  <label>Display Order (Priority)</label>
                  <input type="number" name="sort_order" value={scheduleForm.sort_order} onChange={handleScheduleFieldChange} placeholder="0" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">{editingScheduleId ? 'Save Location Changes' : 'Add Class Location'}</button>
                {editingScheduleId && <button type="button" className="btn btn-secondary" onClick={cancelEditSchedule}>Cancel</button>}
              </div>
            </form>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>City</th><th>Venue</th><th>Program</th><th>Day &amp; Time</th><th>Ages</th><th></th></tr>
                </thead>
                <tbody>
                  {schedules.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No weekly class locations configured yet.</td></tr>
                  ) : schedules.map((loc) => (
                    <tr key={loc.id}>
                      <td><strong>{loc.city}</strong></td>
                      <td>{loc.venue}</td>
                      <td>{loc.program}</td>
                      <td>{loc.day_time}</td>
                      <td>{loc.ages}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-cell">
                          <button type="button" className="btn-table-edit" onClick={() => startEditSchedule(loc)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit
                          </button>
                          <button type="button" className="btn-table-delete" onClick={() => promptDelete({ id: loc.id, title: `${loc.program} at ${loc.venue} (${loc.city})`, type: 'schedule' })}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════ TAB 3: PROGRAM DATES & SESSIONS ════════ */}
        {activeTab === 'sessions' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Upcoming Program Dates (Camps, FLL &amp; Workshops)</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-slate-light)', fontSize: '0.9rem' }}>
                Powers the "Upcoming Dates" and direct registration sections on Camps, Bright Innovators, and Workshop pages.
              </p>
            </div>

            {sessionsError && <p style={{ color: '#DC2626', marginBottom: '1rem' }}>{sessionsError}</p>}

            <form onSubmit={handleSessionSubmit} style={{ marginBottom: '2rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#0F172A' }}>
                {editingSessionId ? '✏️ Edit Session Date' : '➕ Add New Session Date'}
              </h4>
              <div className="form-row">
                <div className="field">
                  <label>Category</label>
                  <select name="category" value={sessionForm.category} onChange={handleSessionFieldChange}>
                    {SESSION_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                {sessionForm.category === 'workshop' && (
                  <div className="field">
                    <label>Theme</label>
                    <select name="theme_slug" value={sessionForm.theme_slug} onChange={handleSessionFieldChange}>
                      <option value="">All / general workshop</option>
                      {THEME_SLUGS.map((slug) => <option key={slug} value={slug}>{slug}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="field">
                <label>Title</label>
                <input type="text" name="title" required value={sessionForm.title} onChange={handleSessionFieldChange} placeholder="e.g. Summer Battle Robots Camp — Week 1" />
              </div>

              <div className="field">
                <label>Description</label>
                <textarea name="description" value={sessionForm.description} onChange={handleSessionFieldChange} placeholder="What kids will build, schedule, etc." rows={3} />
              </div>

              <div className="field">
                <label>Photo</label>
                {sessionForm.image_url && (
                  <img loading="lazy" decoding="async" src={sessionForm.image_url} alt="Preview" style={{ width: '140px', height: '90px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem', display: 'block' }} />
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                {uploadingImage && <p style={{ fontSize: '0.85rem', color: '#0284C7', margin: '0.3rem 0 0' }}>Uploading image…</p>}
                {uploadError && <p style={{ fontSize: '0.85rem', color: '#DC2626', margin: '0.3rem 0 0' }}>{uploadError}</p>}
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Start Date</label>
                  <input type="date" name="start_date" required value={sessionForm.start_date} onChange={handleSessionFieldChange} />
                </div>
                <div className="field">
                  <label>End Date (optional)</label>
                  <input type="date" name="end_date" value={sessionForm.end_date} onChange={handleSessionFieldChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>City</label>
                  <input type="text" name="city" value={sessionForm.city} onChange={handleSessionFieldChange} placeholder="e.g. Allen" />
                </div>
                <div className="field">
                  <label>Venue</label>
                  <input type="text" name="venue" value={sessionForm.venue} onChange={handleSessionFieldChange} placeholder="e.g. Allen STEM Learning Studio" />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Ages</label>
                  <input type="text" name="ages" value={sessionForm.ages} onChange={handleSessionFieldChange} placeholder="e.g. 7-14" />
                </div>
                <div className="field">
                  <label>Spots Note (optional)</label>
                  <input type="text" name="spots_note" value={sessionForm.spots_note} onChange={handleSessionFieldChange} placeholder="e.g. 4 spots left" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary">{editingSessionId ? 'Save Changes' : 'Add Session'}</button>
                {editingSessionId && <button type="button" className="btn btn-secondary" onClick={cancelEditSession}>Cancel</button>}
              </div>
            </form>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Category</th><th>Title</th><th>Dates</th><th>Location</th><th></th></tr>
                </thead>
                <tbody>
                  {sessions.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No session dates scheduled yet.</td></tr>
                  ) : sessions.map((s) => (
                    <tr key={s.id}>
                      <td style={{ textTransform: 'capitalize' }}>{s.category}{s.theme_slug ? ` · ${s.theme_slug}` : ''}</td>
                      <td>{s.title}</td>
                      <td>{s.start_date}{s.end_date ? ` – ${s.end_date}` : ''}</td>
                      <td>{[s.city, s.venue].filter(Boolean).join(' · ') || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-cell">
                          <button type="button" className="btn-table-edit" onClick={() => startEditSession(s)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit
                          </button>
                          <button type="button" className="btn-table-delete" onClick={() => promptDelete({ id: s.id, title: s.title, type: 'session' })}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════ TAB 4: PRICING & PACKAGES ════════ */}
        {activeTab === 'pricing' && (
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Membership Plans &amp; Party Packages</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-slate-light)', fontSize: '0.9rem' }}>
                Configure pricing cards displayed across the website and checkout pages.
              </p>
            </div>

            {pricingError && <p style={{ color: '#DC2626', marginBottom: '1rem' }}>{pricingError}</p>}

            <form onSubmit={handlePricingSubmit} style={{ marginBottom: '2rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', color: '#0F172A' }}>
                {editingPricingId ? '✏️ Edit Pricing Plan' : '➕ Add New Pricing Plan'}
              </h4>

              <div className="form-row">
                <div className="field">
                  <label>Category</label>
                  <select name="category" value={pricingForm.category} onChange={handlePricingFieldChange}>
                    <option value="membership">Monthly / Cycle Membership</option>
                    <option value="party">Birthday Party Package</option>
                  </select>
                </div>
                <div className="field">
                  <label>Plan Name</label>
                  <input type="text" name="name" required value={pricingForm.name} onChange={handlePricingFieldChange} placeholder="e.g. Monthly Membership, Robot Battle Party" />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Price (USD $)</label>
                  <input type="number" step="0.01" name="price_dollars" required value={pricingForm.price_dollars} onChange={handlePricingFieldChange} placeholder="119.00" />
                </div>
                <div className="field">
                  <label>Billing Period / Frequency</label>
                  <select
                    value={periodSelection}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPeriodSelection(val);
                      if (val === 'custom') {
                        setPricingForm((prev) => ({ ...prev, billing_period: customPeriodInput || '' }));
                      } else {
                        setPricingForm((prev) => ({ ...prev, billing_period: val }));
                      }
                    }}
                  >
                    {STANDARD_PERIODS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  {periodSelection === 'custom' && (
                    <input
                      type="text"
                      required
                      placeholder="Enter custom frequency (e.g. session, semester, class)"
                      value={customPeriodInput}
                      onChange={(e) => {
                        setCustomPeriodInput(e.target.value);
                        setPricingForm((prev) => ({ ...prev, billing_period: e.target.value }));
                      }}
                      style={{ marginTop: '0.5rem' }}
                    />
                  )}
                </div>
              </div>

              <div className="field">
                <label>Price Note / Subtitle (optional)</label>
                <input type="text" name="price_note" value={pricingForm.price_note} onChange={handlePricingFieldChange} placeholder="e.g. One weekly class · 8 sessions, or Up to 10 kids" />
              </div>

              <div className="field">
                <label>Features Included (one per line)</label>
                <textarea
                  name="features_text"
                  value={pricingForm.features_text}
                  onChange={handlePricingFieldChange}
                  placeholder={"Robotics or Coding track\nAll materials & kits included\nEnd-of-cycle showcase"}
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Button Label</label>
                  <input type="text" name="cta_label" value={pricingForm.cta_label} onChange={handlePricingFieldChange} placeholder="Get Started or Book Now" />
                </div>
                <div className="field">
                  <label>Display Priority Order</label>
                  <input type="number" name="sort_order" value={pricingForm.sort_order} onChange={handlePricingFieldChange} placeholder="0" />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  <input type="checkbox" name="featured" checked={pricingForm.featured} onChange={handlePricingFieldChange} />
                  Highlight as "Most Popular / Featured" Card
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary">{editingPricingId ? 'Save Plan Changes' : 'Add Pricing Plan'}</button>
                {editingPricingId && <button type="button" className="btn btn-secondary" onClick={cancelEditPricing}>Cancel</button>}
              </div>
            </form>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Category</th><th>Plan Name</th><th>Price</th><th>Period</th><th>Featured</th><th></th></tr>
                </thead>
                <tbody>
                  {pricingPlans.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No pricing plans configured yet.</td></tr>
                  ) : pricingPlans.map((plan) => (
                    <tr key={plan.id}>
                      <td style={{ textTransform: 'capitalize' }}>{plan.category}</td>
                      <td><strong>{plan.name}</strong></td>
                      <td>${((plan.price_cents || 0) / 100).toFixed(2)}</td>
                      <td>/{plan.billing_period}</td>
                      <td>{plan.featured ? '⭐ Featured' : '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-cell">
                          <button type="button" className="btn-table-edit" onClick={() => startEditPricing(plan)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit
                          </button>
                          <button type="button" className="btn-table-delete" onClick={() => promptDelete({ id: plan.id, title: plan.name, type: 'pricing' })}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Universal Delete Confirmation Modal ── */}
        {deleteTarget && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
            }}
            onClick={cancelDelete}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '460px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'fadeIn 0.2s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: '#FEE2E2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#DC2626',
                    fontSize: '1.4rem',
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0F172A' }}>
                    Confirm Deletion
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>This action cannot be undone.</span>
                </div>
              </div>

              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
                Are you sure you want to permanently delete <strong>"{deleteTarget.title}"</strong>?
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    background: '#DC2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.7 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isDeleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
