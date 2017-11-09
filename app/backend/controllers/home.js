'use strict';

/*
 * CONTROLLER: HOME
 */

const config = require(`config-ninja`).use(`eyewitness-ui`);

module.exports = class HomeController {

	/*
	 * Renders the home page.
	 */
	renderHomePage (req, res) {

		res.render(`home`, {
			pageTitle: config.pageTitle,
		});

	}

};
