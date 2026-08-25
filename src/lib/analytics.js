// Lightweight GA4 wrapper. Everything here is a NO-OP until you set
// VITE_GA_MEASUREMENT_ID in your environment (.env), so no analytics script
// loads and no events fire in development or before you've configured a
// property. Swap the loader if you prefer a privacy-first tool like Plausible.
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
let initialized = false;

export function initAnalytics() {
  if (initialized || !GA_ID || typeof window === 'undefined') return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false });
}

export function trackEvent(name, params = {}) {
  if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

export function trackPageview(path) {
  if (!GA_ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', { page_path: path, page_location: window.location.href });
}
