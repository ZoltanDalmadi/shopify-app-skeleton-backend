const cookie = require('cookie');
const validateHMAC = require('./validateHMAC');
const VerificationError = require('./VerificationError');

const hostnameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com\/?$/;

const verifyRequest = (clientSecret, handler) => (req, res) => {
  try {
    if (!req.query.hmac) {
      throw new VerificationError(400, 'Required parameter "hmac" is missing');
    }

    if (req.query.shop && !hostnameRegex.test(req.query.shop)) {
      throw new VerificationError(403, 'Hostname is invalid');
    }

    if (req.query.state) {
      const stateCookie = cookie.parse(req.headers.cookie).state;

      if (req.query.state !== stateCookie) {
        throw new VerificationError(403, 'Request origin cannot be verified');
      }
    }

    if (!validateHMAC(req.query, clientSecret)) {
      throw new VerificationError(403, 'HMAC validation failed');
    }

    return handler(req, res);
  } catch (err) {
    res.status(err.status || 400).send({ error: err.message });
  }
};

module.exports = verifyRequest;
