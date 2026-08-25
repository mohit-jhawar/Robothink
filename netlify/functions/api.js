const serverless = require('serverless-http');
const app = require('../../server/app');

// Netlify routes /api/* to this function (see netlify.toml).
exports.handler = serverless(app);
