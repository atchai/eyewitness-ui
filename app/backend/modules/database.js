'use strict';

/*
 * DATABASE
 */

const config = require(`config-ninja`).use(`eyewitness-ui-config`);

const Hippocamp = require(`@atchai/hippocamp`);
const ArticleModel = require(`../models/article`);
const GlobalSettingsModel = require(`../models/globalSettings`);

/*
 * Allows the caller to connect to the database.
 */
async function connectToEyewitnessDatabase () {

	// Grab our dependencies.
	const DatabaseMongo = Hippocamp.require(`databases/mongo`);

	// Instantiate the database.
	const database = new DatabaseMongo(config.databases.mongo);
	Hippocamp.prepareDependencies(database);

	// Add the models.
	const defaultModels = await Hippocamp.getDefaultModels();
	defaultModels.forEach(model => database.addModel(model));
	database.addModel(ArticleModel);
	database.addModel(GlobalSettingsModel);

	await database.connect();

	return database;

}

/*
 * Export.
 */

module.exports = {
	connectToEyewitnessDatabase,
};
