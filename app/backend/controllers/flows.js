'use strict';

/*
 * CONTROLLER: Flow
 */

const shortId = require(`shortid`);
// import AWS object without services
const AWS = require(`aws-sdk/global`);
// import individual service
const S3 = require(`aws-sdk/clients/s3`);

const config = require(`config-ninja`).use(`eyewitness-ui`);

const { mapListToDictionary } = require(`../modules/utilities`);

module.exports = class FlowsController {

	constructor (database) {
		this.database = database;
	}

	/*
	 * Amalgamates the data for the flows tab.
	 */
	async getDataForFlowsTab () {

		const recFlows = await this.database.find(`Flow`, {});

		// Prepare flows.
		const flows = recFlows.map(recFlow => {
			const interruptions = recFlow.interruptions;

			return Object({
				flowId: recFlow._id,
				name: recFlow.name,
				uri: recFlow.uri,
				actions: recFlow.actions,
				interruptionsWhenAgent: (interruptions && interruptions.whenAgent ? interruptions.whenAgent : `ask-user`),
				interruptionsWhenSubject: (interruptions && interruptions.whenSubject ? interruptions.whenSubject : `ask-user`),
			});
		});

		return {
			flows: mapListToDictionary(flows, `flowId`),
		};

	}

	/*
	 * Upserts a flow.
	 */
	async flowInsertOrUpdate (socket, data, reply) { // eslint-disable-line max-statements

		// Make sure the client passed in safe values.
		const flowId = String(data.flowId);
		const name = String(data.name);
		const uri = String(data.uri);
		const interruptionsWhenAgent = String(data.interruptionsWhenAgent);
		const interruptionsWhenSubject = String(data.interruptionsWhenSubject);

		// Get the flow to update.
		let recFlow = await this.database.get(`Flow`, { _id: flowId });

		// If no flow exists lets create a new one.
		if (!recFlow) {
			recFlow = {
				_id: flowId,
				actions: [],
			};
		}

		// Update the record.
		recFlow.name = name;
		recFlow.uri = uri;

		recFlow.interruptions = recFlow.interruptions || {};
		if (interruptionsWhenAgent) { recFlow.interruptions.whenAgent = interruptionsWhenAgent; }
		if (interruptionsWhenSubject) { recFlow.interruptions.whenSubject = interruptionsWhenSubject; }

		if (Array.isArray(data.actions)) {
			recFlow.actions = data.actions;
		}

		// Update the database.
		await this.database.update(`Flow`, flowId, recFlow, { upsert: true });

		return reply({ success: true });

	}

	/*
	 * Removes a flow.
	 */
	async flowRemove (socket, data, reply) {

		// Make sure the client passed in safe values.
		const flowId = String(data.flowId);

		// Update the database.
		await this.database.delete(`Flow`, flowId);

		return reply({ success: true });
	}

	/*
	 * Returns the tab data for the flows tab.
	 */
	async flowsPullTabData (socket, data, reply) {
		const { flows } = await this.getDataForFlowsTab(data);
		return reply({ success: true, flows });
	}

	/*
	 * Upload image data to S3.
	 */
	async uploadImage (socket, data, reply) {

		// save to Amazon S3 bucket
		const s3 = new S3();
		const keyPrefix = config.amazonS3.keyPrefix.replace(/\/$/, ``);
		const randomisedFilename = shortId.generate();
		const fullKey = `${keyPrefix}/${randomisedFilename}`;
		const params = {
			Bucket: config.amazonS3.bucketName,
			Key: fullKey,
			Body: data.filedata,
			ContentType: data.type,
			ACL: `public-read`,
		};

		try {
			await s3.putObject(params).promise(); // note this will override existing images
			const objectUrl = `https://s3.${config.amazonS3.region}.amazonaws.com/` +
				`${config.amazonS3.bucketName}/${fullKey}`;
			return reply({ success: true, name: data.name, url: objectUrl });
		}
		catch (err) {
			throw new Error(`Error uploading data: ${err}`);
		}

	}

	/*
	 * Deletes the given image from S3.
	 */
	async deleteImage (socket, data, reply) {

		const s3 = new AWS.S3();
		const keyPrefix = config.amazonS3.keyPrefix.replace(/\/$/, ``);
		const keyName = data.url.substr(data.url.lastIndexOf(`/`) + 1);
		const fullKey = `${keyPrefix}/${keyName}`;
		const params = {
			Bucket: config.amazonS3.bucketName,
			Key: fullKey,
		};

		await s3.deleteObject(params).promise();

		return reply({ success: true });

	}

};

