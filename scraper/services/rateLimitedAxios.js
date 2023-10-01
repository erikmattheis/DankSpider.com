const axios = require('axios');
const rateLimit = require('axios-rate-limit');

const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) DankSpider.com shockingelk@gmail.com';

const rateLimitedAxios = rateLimit(axios.create({ headers: { 'User-Agent': agent } }), {
  maxRequests: 1,
  perMilliseconds: 410,
});

module.exports = rateLimitedAxios;