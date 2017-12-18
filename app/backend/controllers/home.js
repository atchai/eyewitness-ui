'use strict';

/*
 * CONTROLLER: Home
 */

const config = require(`config-ninja`).use(`eyewitness-ui`);

module.exports = class HomeController {

	/*
	 * Renders the home page.
	 */
	renderHomePage (req, res) {

		res.render(`home`, {
			pageTitle: config.pageTitle,
			appConfig: JSON.stringify({
				pageInitialSize: config.pageInitialSize,
				pageBufferSize: config.pageBufferSize,
				scrollBufferPx: config.scrollBufferPx,
				providerPhotoUrl: `https://graph.facebook.com/${config.facebookPageId}/picture?type=large`,
			}),
		});

	}

};
