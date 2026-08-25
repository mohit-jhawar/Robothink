import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Fixed bottom conversion bar shown on mobile only (CSS-gated to <=768px).
 * Hidden on /contact — the lead form already lives there, so the bar would be
 * redundant and could cover the form's submit button.
 */
export default function StickyMobileCTA() {
  const location = useLocation();
  if (location.pathname.startsWith('/contact')) return null;

  return (
    <div className="sticky-mobile-cta">
      <Link to="/contact?type=trial" className="btn btn-primary btn-block">
        🤖 Claim Free Trial Class
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '0.4rem' }}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </Link>
    </div>
  );
}
