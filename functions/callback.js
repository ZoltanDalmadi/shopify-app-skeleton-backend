const axios = require('axios');
const verifyRequest = require('../common/verifyRequest');

const callback = ({ client_id, client_secret, frontend_uri }) =>
  verifyRequest(client_secret, (req, res) => {
    const { shop, code } = req.query;
    const accessTokenURL = `https://${shop}/admin/oauth/access_token`;

    const body = {
      client_id,
      client_secret,
      code,
    };

    return axios
      .post(accessTokenURL, body)
      .then(({ data }) => {
        // TODO: SAVE THESE TO DB
        console.log(data.access_token);
        console.log(data.scope);
      })
      .then(() => res.redirect(frontend_uri))
      .catch(err => res.status(500).send(err.message));
  });

module.exports = callback;
