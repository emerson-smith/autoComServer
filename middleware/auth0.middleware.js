const { auth } = require("express-oauth2-jwt-bearer");
const env = require("../config/env.js");

const validateAuth0 = auth({
	issuerBaseURL: `https://${env.AUTH0_DOMAIN}`,
	audience: env.AUTH0_AUDIENCE,
	tokenSigningAlg: "RS256",
});

module.exports = {
	validateAuth0,
};
