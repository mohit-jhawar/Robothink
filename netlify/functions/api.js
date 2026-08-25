const serverless = require('serverless-http');
const app = require('../../server/app');

// Netlify routes /api/* to this function (see netlify.toml). basePath strips
// the function's own path prefix so Express sees clean routes like /leads.
exports.handler = serverless(app, { basePath: '/.netlify/functions/api' });
