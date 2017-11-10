'use strict';

/*
 * BACKEND ENTRY POINT
 */

// Ensure we always work relative to this script.
process.chdir(__dirname);

const path = require(`path`);
const config = require(`config-ninja`).init(`eyewitness-ui`, path.join(`..`, `config`));

const { connectToEyewitnessDatabase } = require(`eyewitness`);
const server = require(`./modules/server`);

/*
 * The main function.
 */
async function main () {

	await server.start(config.server.port);

	await connectToEyewitnessDatabase();

}

/*
 * Execute.
 */
main()
	.catch(err => console.error(err.stack));  // eslint-disable-line no-console
