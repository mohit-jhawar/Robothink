const Stripe = require('stripe');

let client = null;

function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    client = new Stripe(key, { apiVersion: '2024-06-20' });
  }
  return client;
}

module.exports = { getStripe };
