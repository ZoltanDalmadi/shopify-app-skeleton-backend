const { createHmac, timingSafeEqual } = require('crypto');
const { stringify } = require('querystring');

const validateHMAC = (query, clientSecret) => {
  const hmac = query.hmac;

  const queryWoHMAC = Object.keys(query).reduce(
    (obj, param) => (param !== 'hmac' && (obj[param] = query[param]), obj),
    {}
  );

  const message = stringify(queryWoHMAC);

  const generatedHMAC = createHmac('sha256', clientSecret)
    .update(message)
    .digest('hex');

  let value;

  try {
    value = timingSafeEqual(Buffer.from(hmac), Buffer.from(generatedHMAC));
  } catch (_) {
    value = false;
  }

  return value;
};

module.exports = validateHMAC;
