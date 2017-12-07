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

	console.error(`A controller error occured:\n`, err.stack); // eslint-disable-line no-console

	// The HTTP status code should be 200 if we are returning JSON.
	if (req.headers[`content-type`] === `application/json`) {

		return res.json({
			success: false,
			error: err.message,
		});

	}

	return res.status(500).end(`A controller error occured because of "${err}".`);

}

/*
 * Export.
 */
module.exports = {
	healthCheck,
	enforceHttps,
	handleErrors,
};
