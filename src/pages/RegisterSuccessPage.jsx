import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import { trackEvent } from '../lib/analytics';

// Stripe redirects here with ?session_id=<checkout session id>. The webhook that
// marks the registration 'paid' may land a moment later, so we poll briefly.
export default function RegisterSuccessPage() {
  useDocumentMeta({ title: 'Registration Confirmed', noindex: true });
  const [searchParams] = useSearchParams();
  const checkoutSessionId = searchParams.get('session_id');
  const [reg, setReg] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!checkoutSessionId) { setDone(true); return; }
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/register/status/${checkoutSessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;
          setReg(data);
          if (data.status === 'paid') { trackEvent('purchase', { transaction_id: checkoutSessionId }); }
          if (data.status === 'paid' || attempts >= 5) { setDone(true); return; }
        } else if (attempts >= 5) { setDone(true); return; }
      } catch {
        if (attempts >= 5) { setDone(true); return; }
      }
      if (!cancelled) setTimeout(poll, 1500);
    };
    poll();
    return () => { cancelled = true; };
  }, [checkoutSessionId]);

  const paid = reg?.status === 'paid';

  return (
    <section className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '560px' }}>
        <div className="modal-icon" style={{ margin: '0 auto 1.25rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h1>Payment received — you're all set! 🎉</h1>
        {!done ? (
          <p style={{ color: 'var(--color-slate-light)' }}>Confirming your registration…</p>
        ) : (
          <p style={{ color: 'var(--color-slate-light)', fontSize: '1.05rem' }}>
            {reg?.child_name ? `We've reserved ${reg.child_name}'s spot` : "We've reserved your spot"}
            {reg?.session_title ? ` in ${reg.session_title}` : ''}. A confirmation email is on its way
            {paid ? '' : ' shortly'}. We can't wait to start building!
          </p>
        )}
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
          <Link to="/" className="btn btn-primary">Back to Home</Link>
          <Link to="/parents#finder" className="btn btn-secondary">Browse More Classes</Link>
        </div>
      </div>
    </section>
  );
}
