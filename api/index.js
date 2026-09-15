// Vercel Serverless Function entry point for Express app
const app = require('../dist/server.cjs').default || require('../dist/server.cjs');

module.exports = app;
