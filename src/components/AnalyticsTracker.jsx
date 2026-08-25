import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../lib/analytics';

// Fires a GA4 page_view on every client-side route change (SPA navigations
// don't reload the page, so GA won't see them otherwise). No-op until GA is
// configured. Rendered once inside <App>.
export default function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}
