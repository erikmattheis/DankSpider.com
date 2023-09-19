const axios = require('axios');
const rateLimit = require('axios-rate-limit');
const rateLimitedAxios = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: 1000,
});

module.exports = rateLimitedAxios;