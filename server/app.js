const express = require('express');
const cors = require('cors');

const leadsRouter = require('./routes/leads');
const pricingRouter = require('./routes/pricing');
const scheduleRouter = require('./routes/schedule');
const sessionsRouter = require('./routes/sessions');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const checkoutRouter = require('./routes/checkout');
const registerRouter = require('./routes/register');
const portalRouter = require('./routes/portal');
const { stripeWebhookHandler } = require('./routes/webhooks');
const { rateLimit } = require('./lib/rateLimit');

const app = express();

app.use(cors());

// Normalize URL prefixes so routes match whether called directly (/admin/login),
// via Vite proxy (/api/admin/login), or via Netlify Functions (/.netlify/functions/api/admin/login).
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '') || '/';
  }
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '') || '/';
  }
  next();
});

// Stripe requires the raw request body to verify webhook signatures, so this
// route must be registered (with its own raw-body parser) BEFORE the global
// express.json() below — otherwise json() would consume/parse the body first.
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => res.json({ ok: true }));

// Throttle the public write endpoints to blunt spam/abuse bursts.
const publicWriteLimiter = rateLimit({ windowMs: 60000, max: 8 });
app.use('/leads', publicWriteLimiter);
app.use('/register', publicWriteLimiter);

app.use('/leads', leadsRouter);
app.use('/pricing', pricingRouter);
app.use('/schedule', scheduleRouter);
app.use('/sessions', sessionsRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/checkout', checkoutRouter);
app.use('/register', registerRouter);
app.use('/portal', portalRouter);

// 404 for anything else under the API
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Centralized error handler — keeps unexpected throws from leaking stack traces
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[api] unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
