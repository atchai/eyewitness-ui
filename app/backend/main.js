'use strict';

/*
 * BACKEND ENTRY POINT
 */

// Ensure we always work relative to this script.
process.chdir(__dirname);

const path = require(`path`);
const providerId = process.env.PROVIDER_ID;
const loadProviderConfig = Boolean(providerId);
const env = process.env.NODE_ENV || `development`;
const localConfigName = path.join(`providers`, `${providerId}.${env}`);

const config = require(`config-ninja`).init(`eyewitness-ui`, path.join(`..`, `config`), {
	localConfig: (localConfigName ? [ localConfigName ] : []),
	requireLocalConfig: loadProviderConfig,
});

const { connectToEyewitnessDatabase } = require(`eyewitness`);
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

	const database = await connectToEyewitnessDatabase();

	await server.start(config.server.port, database);

}

/*
 * Execute.
 */
main()
	.catch(err => console.error(err.stack)); // eslint-disable-line
