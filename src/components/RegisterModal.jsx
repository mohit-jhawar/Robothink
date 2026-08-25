import React, { useState, useEffect, useRef } from 'react';
import { formatPhone } from '../lib/formatPhone';
import { useToast } from './ToastProvider';
import { trackEvent } from '../lib/analytics';

function formatPrice(cents) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

/**
 * Guest registration form. Collects parent/child details, POSTs to /api/register,
 * then redirects the browser to Stripe Checkout. No account is created.
 */
export default function RegisterModal({ open, onClose, session }) {
  const showToast = useToast();
  const dialogRef = useRef(null);
  const [form, setForm] = useState({
    parent_name: '',
    parent_email: '',
    parent_phone: '',
    child_name: '',
    child_age: '',
    city: session?.city || '',
    company: '', // honeypot — must stay empty
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape and move focus into the dialog when it opens.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    if (dialogRef.current) dialogRef.current.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !session) return null;

  const change = (e) => {
    const value = e.target.name === 'parent_phone' ? formatPhone(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || 'Could not start registration. Please try again.';
        setError(msg);
        showToast(msg, 'error');
        setSubmitting(false);
        return;
      }
      // Hand off to Stripe Checkout.
      trackEvent('begin_checkout', { item_name: session.title, value: (session.price_cents || 0) / 100, currency: 'USD' });
      window.location.assign(data.url);
    } catch (err) {
      const msg = 'Network error — please check your connection and try again.';
      setError(msg);
      showToast(msg, 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div
        className="modal-box modal-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-modal-title"
        tabIndex={-1}
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close-x" aria-label="Close registration dialog" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
        <h3 id="register-modal-title" style={{ textAlign: 'left' }}>Register for {session.title}</h3>
        <p style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
          {formatPrice(session.price_cents)} · secure checkout via Stripe. You'll be redirected to pay.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="hp-field" aria-hidden="true">
            <label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={change} /></label>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Parent Name</label>
              <input type="text" name="parent_name" required value={form.parent_name} onChange={change} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" name="parent_email" required value={form.parent_email} onChange={change} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Phone</label>
              <input type="tel" name="parent_phone" value={form.parent_phone} onChange={change} />
            </div>
            <div className="field">
              <label>City</label>
              <input type="text" name="city" value={form.city} onChange={change} />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Child's Name</label>
              <input type="text" name="child_name" required value={form.child_name} onChange={change} />
            </div>
            <div className="field">
              <label>Child's Age</label>
              <input type="number" name="child_age" min="3" max="18" value={form.child_age} onChange={change} />
            </div>
          </div>

          {error && <p style={{ color: 'var(--color-error, #DC2626)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Starting checkout…' : `Register & Pay ${formatPrice(session.price_cents)} →`}
          </button>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-slate-light)', textAlign: 'center', marginTop: '0.75rem', marginBottom: 0 }}>
            🔒 Payments are processed securely by Stripe. We never see your card details.
          </p>
        </form>
      </div>
    </div>
  );
}
