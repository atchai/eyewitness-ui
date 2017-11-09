'use strict';

/*
 * MAIN ENTRY POINT
 */

// Ensure we always work relative to this script.
process.chdir(__dirname);

const config = require(`config-ninja`).init(`eyewitness-ui`, `./config`);

const { connectToEyewitnessDatabase } = require(`eyewitness`);
const server = require(`./modules/server`);

const { PROVIDER_ID, NODE_ENV } = process.env;

/*
 * The main function.
 */
async function main () {

	await server.start(config.server.port);

	await connectToEyewitnessDatabase(PROVIDER_ID, NODE_ENV);

}

/*
 * Execute.
 */
main()
	.catch(err => console.error(err.stack));  // eslint-disable-line no-console
