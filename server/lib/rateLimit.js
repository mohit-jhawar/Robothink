// Simple in-memory sliding-window rate limiter.
//
// NOTE: On serverless (Netlify Functions) memory isn't shared across cold
// starts or concurrent instances, so this throttles bursts within a warm
// instance but isn't a global guarantee. It's a cheap first line of defense —
// pair it with the honeypot check on each form. For strict global limits use a
// shared store (e.g. Upstash Redis).
const buckets = new Map();
const MAX_TRACKED_IPS = 5000;

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.toString().split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function rateLimit({ windowMs = 60000, max = 10 } = {}) {
  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();
    const ip = clientIp(req);
    let entry = buckets.get(ip);
    if (!entry || now > entry.reset) {
      entry = { count: 0, reset: now + windowMs };
    }
    entry.count += 1;
    buckets.set(ip, entry);

    // Opportunistic cleanup so the map can't grow without bound.
    if (buckets.size > MAX_TRACKED_IPS) {
      for (const [key, val] of buckets) {
        if (now > val.reset) buckets.delete(key);
      }
    }

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.reset - now) / 1000);
      res.set('Retry-After', String(Math.max(1, retryAfter)));
      return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
    }
    next();
  };
}

module.exports = { rateLimit };
