import { useEffect } from 'react';

// Update these if the production domain / default share image changes.
export const SITE_NAME = 'RoboThink Collin County';
export const BASE_URL = 'https://robothinkcollincounty.com';
const DEFAULT_IMAGE = '/assets/photos/hero_ai_student.png';

function upsertMeta(attr, key, content) {
  if (content == null || content === '') return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Per-route document head management: title, description, canonical, and
 * Open Graph / Twitter card tags. Call once near the top of each page.
 *
 * @param {{ title?: string, description?: string, image?: string, noindex?: boolean }} opts
 */
export function useDocumentMeta({ title, description, image, noindex = false } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    const url = BASE_URL + window.location.pathname;
    const img = image || DEFAULT_IMAGE;
    const absImage = img.startsWith('http') ? img : BASE_URL + img;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', absImage);
    upsertMeta('property', 'og:site_name', SITE_NAME);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', absImage);

    upsertLink('canonical', url);
  }, [title, description, image, noindex]);
}
