// Parsing error: require() of ES Module /Users/erikmattheis/Desktop/Dropbox/DankSpider.com/node_modules/eslint-scope/lib/definition.js from /Users/erikmattheis/Desktop/Dropbox/DankSpider.com/node_modules/babel-eslint/lib/require-from-eslint.js not supported.
// Instead change the require of definition.js in /Users/erikmattheis/Desktop/Dropbox/DankSpider.com/node_modules/babel-eslint/lib/require-from-eslint.js to a dynamic import() which is available in all CommonJS modules.

const axios = require('axios');
const rateLimit = require('axios-rate-limit');

const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) DankSpider.com shockingelk@gmail.com';

const rateLimitedAxios = rateLimit(axios.create({ headers: { 'User-Agent': agent } }), {
  maxRequests: 1,
  perMilliseconds: 3100,
});

module.exports = rateLimitedAxios;