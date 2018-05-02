'use strict';

/*
 * CONTROLLER: Flow
 */

const shortId = require(`shortid`);
// import AWS object without services
const AWS = require(`aws-sdk/global`);
// import individual service
const S3 = require(`aws-sdk/clients/s3`);
const RequestNinja = require(`request-ninja`);

const config = require(`config-ninja`).use(`eyewitness-ui`);

const { mapListToDictionary } = require(`../modules/utilities`);

module.exports = class FlowsController {

	constructor (database) {
		this.database = database;
		this.flowUpdateUrl = `${config.hippocampServer.baseUrl}/api/flow/reload-dynamic`;
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

		recFlow.prompt = null;

		recFlow.interruptions = recFlow.interruptions || {};
		if (interruptionsWhenAgent) { recFlow.interruptions.whenAgent = interruptionsWhenAgent; }
		if (interruptionsWhenSubject) { recFlow.interruptions.whenSubject = interruptionsWhenSubject; }

		if (Array.isArray(data.actions)) {
			recFlow.actions = data.actions;
			recFlow.actions.forEach(action => {
				action.task = (action.task && action.task.taskId && action.task) || null;

				action.conditional = action.uiMeta.conditional
					? this.generateConditionalExpression(action.uiMeta.conditional) : null;
			});
		}

		// Update the database.
		await this.database.update(`Flow`, flowId, recFlow, { upsert: true });

		await this.reloadFlow(flowId);

		return reply({ success: true });

	}

	/*
	 * Generates a javascript expression from conditional { matchType, memoryKey, operator, value }
	 */
	generateConditionalExpression (conditional) {

		// Use the conditional exactly as typed if an expression was chosen.
		if (conditional.matchType === `expression`) {
			return conditional.expression;
		}

		// Preformatted conditional types.
		const preparedKey = `<${conditional.memoryKey.replace(/\//g, `.`)}>`;
		const preparedValue = (typeof conditional.value === `string`) ? `'${conditional.value.replace(/'/g, `\'`)}'` : ``;

		switch (conditional.operator) {
			case `set`:
				return preparedKey;
			case `not-set`:
				return `!${preparedKey}`;
			case `equals`:
				return `${preparedKey} == ${preparedValue}`; // intentionally not using === for greater type flexibility
			case `not-equals`:
				return `${preparedKey} != ${preparedValue}`; // intentionally not using !== for greater type flexibility
			case `contains`:
				return `${preparedKey}.includes(${preparedValue})`;
			case `starts-with`:
				return `String(${preparedKey}).startsWith(${preparedValue})`;
			case `ends-with`:
				return `String(${preparedKey}).endsWith(${preparedValue})`;
			default:
				throw new Error(`Conditional operator "${conditional.operator}" is not supported.`);
		}

	}

	/**
	 * Tell the bot to reload a flow.
	 *
	 * @param {string|void} flowId ID of flow to reload.
	 * @returns {Promise<void>} N/A
	 */
	async reloadFlow (flowId = undefined) {

		// Send the message to Hippocamp which will disable the bot.
		const req = new RequestNinja(this.flowUpdateUrl, {
			timeout: (1000 * 3),
			returnResponseObject: true,
		});

		const flowIds = [];
		if (flowId) {
			flowIds.push(flowId);
		}
		const res = await req.postJson({ flowIds });

		if (res.statusCode !== 200) {
			throw new Error(`Non 200 HTTP status code "${res.statusCode}" returned by Hippocamp.`);
		}

		if (!res.body || !res.body.success) {
			throw new Error(`Hippocamp returned an error: "${res.body.error}".`);
		}

		if (res.body.failedFlowIds && res.body.failedFlowIds.length) {
			throw new Error(`Hippocamp failed to load flows ${res.body.failedFlowIds}".`);
		}

	}

	/*
	 * Removes a flow.
	 */
	async flowRemove (socket, data, reply) {

		// Make sure the client passed in safe values.
		const flowId = String(data.flowId);

		// Update the database.
		await this.database.delete(`Flow`, flowId);

		await this.reloadFlow(); // reload all flows

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

