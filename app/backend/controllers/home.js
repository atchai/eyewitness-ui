'use strict';

/*
 * CONTROLLER: HOME
 */

const config = require(`config-ninja`).use(`eyewitness-ui`);

/*
 * Renders the home page.
 */
function renderHomePage (req, res) {

	res.render(`home`, {
		pageTitle: config.pageTitle,
	});

}

/*
 * Export.
 */
module.exports = {
	renderHomePage,
};
