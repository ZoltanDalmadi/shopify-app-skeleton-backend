const nonce = require('nonce')();
const verifyRequest = require('../common/verifyRequest');

const install = ({ client_id, client_secret, scope, redirect_uri }) =>
  verifyRequest(client_secret, (req, res) => {
    console.log(req.query);
    const state = nonce();

    const oauthURL = new URL(`https://${req.query.shop}/admin/oauth/authorize`);

    oauthURL.searchParams.append('client_id', client_id);
    oauthURL.searchParams.append('scope', scope);
    oauthURL.searchParams.append('state', state);
    oauthURL.searchParams.append('redirect_uri', redirect_uri);

    res.cookie('state', state);

    return res.redirect(oauthURL.toString());
  });

module.exports = install;
