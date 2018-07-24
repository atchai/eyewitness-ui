'use strict';

/*
 * BACKEND ENTRY POINT
 */

// Ensure we always work relative to this script.
process.chdir(__dirname);

const path = require(`path`);

const config = require(`config-ninja`).init(`eyewitness-ui-config`, `./config`, {
	environmentVariables: {
		enableDotenv: (process.env.NODE_ENV === `development`),
		dotenvPath: path.join(__dirname, `..`, `..`, `.env`),
		mapping: {
			DB_MONGO_CONNECTION_STR: `databases.mongo.connectionString`,
			AUTH_COOKIE_SECRET: `authentication.cookie.secret`,
			USER_PWD_BOT: `authentication.basicAuth.users.bot`,
			USER_PWD_ADMIN: `authentication.basicAuth.users.admin`,
			FB_PAGE_ID: `facebookPageId`,
			UI_SERVER_URI: `server.externalUri`,
			BOT_SERVER_URI: `hippocampServer.endpoint`,
			BOT_SERVER_ACCESS_TOKEN: `hippocampServer.accessToken`,
			AWS_S3_ACCESS_KEY_ID: `amazonS3.accessKeyId`,
			AWS_S3_SECRET_ACCESS_KEY: `amazonS3.secretAccessKey`,
			AWS_S3_REGION: `amazonS3.region`,
			AWS_S3_BUCKET: `amazonS3.bucketName`,
			AWS_S3_KEY_PREFIX: `amazonS3.keyPrefix`,
		},
	},
});

const server = require(`./modules/server`);

// If there is no listener for unhandled promise rejections then we add our own to output a stack trace and quit.
if (!process.eventNames().includes(`unhandledRejection`)) {

	process.on(`unhandledRejection`, err => { // eslint-disable-line promise/prefer-await-to-callbacks
		/* eslint no-console: 0 */
		console.error(``);
		console.error(`Unhandled promise rejection!`);
		console.error(`This should NEVER happen - promise rejections MUST be handled correctly.`);
		console.error(``);
		console.error(err.stack);
		process.exit(1);
	});

}

/*
 * The main function.
 */
async function main () {

	const port = process.env.PORT || config.server.port;
	const database = await connectToEyewitnessDatabase();

	await server.start(port, database);

}

/*
 * Execute.
 */
main()
	.catch(err => console.error(err.stack)); // eslint-disable-line
