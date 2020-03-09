const install = require('./functions/install');
const callback = require('./functions/callback');

const config = {
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  scope: process.env.SCOPE,
  redirect_uri: process.env.REDIRECT_URI,
  frontend_uri: process.env.FRONTEND_URI,
};

exports.install = install(config);
exports.callback = callback(config);
