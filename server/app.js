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

// Stripe requires the raw request body to verify webhook signatures, so this
// route must be registered (with its own raw-body parser) BEFORE the global
// express.json() below — otherwise json() would consume/parse the body first.
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookHandler);

app.use(express.json({ limit: '100kb' }));

// Core API router containing all routes
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => res.json({ ok: true }));

// Throttle the public write endpoints to blunt spam/abuse bursts.
const publicWriteLimiter = rateLimit({ windowMs: 60000, max: 8 });
apiRouter.use('/leads', publicWriteLimiter);
apiRouter.use('/register', publicWriteLimiter);

apiRouter.use('/leads', leadsRouter);
apiRouter.use('/pricing', pricingRouter);
apiRouter.use('/schedule', scheduleRouter);
apiRouter.use('/sessions', sessionsRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/checkout', checkoutRouter);
apiRouter.use('/register', registerRouter);
apiRouter.use('/portal', portalRouter);

// Mount the API router across all possible entry paths
app.use('/.netlify/functions/api', apiRouter);
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 404 for anything else under the API
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Centralized error handler — keeps unexpected throws from leaking stack traces
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[api] unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
