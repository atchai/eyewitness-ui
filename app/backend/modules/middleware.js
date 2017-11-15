'use strict';

/*
 * MIDDLEWARE
 */

const config = require(`config-ninja`).use(`eyewitness-ui`);

/*
 * Respond with a HTTP 200 to any requests to the health check endpoint.
 */
function healthCheck (req, res) {
	return res.end(`OK`);
}

/*
 * Redirect all end-client requests to HTTPS.
 */
function enforceHttps (req, res, next) {
	if (config.env.level < 3 && req.headers[`x-forwarded-proto`] === `http`) {
		return res.redirect(`https://${req.headers.host}${req.url}`);
	}

	return next(null);
}

/*
 * Handles errors in any of the routes.
 */
function handleErrors (err, req, res, next) { // eslint-disable-line no-unused-vars
	return res.status(500).end(`A fatal error occured: "${err}".`);
}

/*
 * Export.
 */
module.exports = {
	healthCheck,
	enforceHttps,
	handleErrors,
};
