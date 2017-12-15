'use strict';

/*
 * CONTROLLER: Events
 */

const config = require(`config-ninja`).use(`eyewitness-ui`);

const deepSort = require(`deep-sort`);
const moment = require(`moment`);
const RequestNinja = require(`request-ninja`);
const { mapListToDictionary, parseLatestMessageInformation } = require(`../modules/utilities`);

module.exports = class EventsController {

	constructor (database) {

		this.database = database;
		this.hippocampUrl = `${config.hippocampServer.baseUrl}/api/adapter/web`;

	}

	/*
	 * Sends the welcome event to a new client.
	 */
	async emitWelcomeEvent (socket) {

		const output = {

		};

		// Push data to client.
		socket.emit(`welcome`, output);

	}

	/*
	 * Returns the information for the latest human to human or incoming message.
	 */
	async getLatestThreadMessage (userId) {

		const recMessages = await this.database.find(`Message`, {
			_user: userId,
			$or: [
				{ humanToHuman: true },
				{ direction: `incoming` },
			],
		}, {
			limit: 1,
			sort: { sentAt: `desc` },
		});

		return parseLatestMessageInformation(recMessages[0]);

	}

	/*
	 * Prepares thread data for the frontend and maps the list to a dictionary.
	 */
	async prepareThreads (recUsers, pageInitialSize, isHardLimit = false) {

		const threads = [];

		for (let index = 0; index < recUsers.length; index++) {
			const recUser = recUsers[index];
			const thread = { itemId: recUser._id.toString() };

			// Full-fat threads contain all properties.
			if (index < pageInitialSize) {
				const { latestMessage, latestDate } = await this.getLatestThreadMessage(recUser._id); // eslint-disable-line no-await-in-loop
				const adminLastReadMessages = moment((recUser.appData && recUser.appData.adminLastReadMessages) || 0);

				thread.isFullFat = true;
				thread.userFullName = `${recUser.profile.firstName} ${recUser.profile.lastName}`.trim();
				thread.latestMessage = latestMessage;
				thread.latestDate = latestDate;
				thread.botEnabled = !(recUser.bot && recUser.bot.disabled);
				thread.adminLastReadMessages = adminLastReadMessages.toISOString();
			}

			// Don't add any low-fat threads if we have a hard limit.
			else if (isHardLimit) {
				break;
			}

			// Low-fat threads only contain the item ID.
			else {
				thread.isFullFat = false;
			}

			threads.push(thread);
		}

		// We must sort threads by their latest message date.
		deepSort(threads, `latestDate`, `desc`);

		return mapListToDictionary(threads, `itemId`);

	}

	/*
	 * Prepares story data for the frontend and maps the list to a dictionary.
	 */
	prepareStories (recArticles, pageInitialSize, isHardLimit = false) {

		const stories = [];

		for (let index = 0; index < recArticles.length; index++) {
			const recArticle = recArticles[index];
			const story = { itemId: recArticle._id.toString() };

			// Full-fat stories contain all properties.
			if (index < pageInitialSize) {
				story.isFullFat = true;
				story.title = recArticle.title;
				story.articleUrl = recArticle.articleUrl;
				story.articleDate = recArticle.articleDate;
				story.priority = (typeof recArticle.isPriority !== `undefined` ? recArticle.isPriority : false);
				story.published = (typeof recArticle.isPublished !== `undefined` ? recArticle.isPublished : true);
			}

			// Don't add any low-fat stories if we have a hard limit.
			else if (isHardLimit) {
				break;
			}

			// Low-fat stories only contain the item ID.
			else {
				story.isFullFat = false;
			}

			stories.push(story);
		}

		return mapListToDictionary(stories, `itemId`);

	}

	/*
	 * Prepares welcome message data for the frontend and maps the list to a dictionary.
	 */
	prepareWelcomeMessages (recWelcomeMessages) {

		const welcomeMessages = [];

		for (let index = 0; index < recWelcomeMessages.length; index++) {
			const recWelcomeMessage = recWelcomeMessages[index];
			const welcomeMessage = { welcomeMessageId: recWelcomeMessage._id.toString() };

			// Full-fat welcome messages contain all properties.
			welcomeMessage.isFullFat = true;
			welcomeMessage.text = recWelcomeMessage.text;
			welcomeMessage.weight = recWelcomeMessage.weight;

			welcomeMessages.push(welcomeMessage);
		}

		return mapListToDictionary(welcomeMessages, `welcomeMessageId`);

	}

	/*
	 * Returns multiple items from the given model.
	 */
	async getItems (modelName, sortField = null, sortDirection = null) {

		const options = {};

		if (sortField && sortDirection) {
			options.sort = { [sortField]: sortDirection };
		}

		const records = await this.database.find(modelName, {}, options);

		return records || [];

	}

	/*
	 * Returns prepared items from the given model based on the specified array of item IDs.
	 */
	async getItemsById (modelName, itemIds) {

		const records = await this.database.find(modelName, {
			$or: itemIds.map(id => Object({ _id: id })),
		});

		return records || [];

	}

	/*
	 * Returns the list of threads for the messaging tab.
	 */
	async messagingGetThreads (socket, data, reply) {

		let records;

		// Get the relevant thread records.
		if (data.itemIdsToFetch) {
			records = await this.getItemsById(`User`, data.itemIdsToFetch);
		}
		else {
			records = await this.getItems(`User`);
		}

		const threads = await this.prepareThreads(records, data.pageInitialSize);

		return reply({
			success: true,
			threads,
		});

	}

	/*
	 * Returns the data for the stories tab.
	 */
	async storiesGetTabData (socket, data, reply) {

		let records;

		// Get the relevant records.
		if (data.itemIdsToFetch) {
			records = await this.getItemsById(`Article`, data.itemIdsToFetch);
		}
		else {
			records = await this.getItems(`Article`, `articleDate`, `desc`);
		}

		const stories = this.prepareStories(records, data.pageInitialSize);

		return reply({
			success: true,
			stories,
		});

	}

	/*
	 * Update the "isPublished" property of the given story.
	 */
	async storiesSetStoryPublished (socket, data, reply) {

		// Make sure the client passed in safe values.
		const itemId = String(data.itemId);
		const isPublished = Boolean(data.published);

		// Update the database.
		await this.database.update(`Article`, itemId, { isPublished });

		return reply({ success: true });

	}

	/*
	 * Returns the data for the settings tab.
	 */
	async settingsGetTabData (socket, data, reply) {

		const records = await this.getItems(`WelcomeMessage`, `weight`, `asc`);
		const welcomeMessages = this.prepareWelcomeMessages(records);

		return reply({ success: true, welcomeMessages });

	}

	/*
	 * Allow the bot to be turned on/off for all users.
	 */
	async settingsSetBotEnabled (socket, data, reply) {

		// Make sure the client passed in safe values.
		const isBotEnabled = Boolean(data.enabled);

		// Update the database.
		const recSettings = await this.database.find(`Settings`, {})[0];
		await this.database.update(`Settings`, recSettings, { isBotEnabled });

		return reply({ success: true });

	}

	/*
	 * Upserts a welcome message.
	 */
	async settingsWelcomeMessageUpdate (socket, data, reply) {

		// Make sure the client passed in safe values.
		const welcomeMessageId = String(data.welcomeMessageId);
		const text = String(data.text);
		const weight = Number(data.weight);

		// Get the welcome message to update.
		let recWelcomeMessage = await this.database.get(`WelcomeMessage`, { _id: welcomeMessageId });

		// If no welcome message exists lets create a new one.
		if (!recWelcomeMessage) {
			recWelcomeMessage = {
				_id: welcomeMessageId,
			};
		}

		// Update the record.
		recWelcomeMessage.text = text;
		recWelcomeMessage.weight = weight;

		// Update the database.
		await this.database.update(`WelcomeMessage`, welcomeMessageId, recWelcomeMessage, { upsert: true });

		return reply({ success: true });

	}

	/*
	 * Upserts a welcome message.
	 */
	async settingsWelcomeMessageRemove (socket, data, reply) {

		// Make sure the client passed in safe values.
		const welcomeMessageId = String(data.welcomeMessageId);

		// Update the database.
		await this.database.delete(`WelcomeMessage`, welcomeMessageId);

		return reply({ success: true });

	}











	/*
	 * Returns the tab data for the messaging tab.
	 */
	async messagingPullTabData (socket, data, reply) {
		const { threads } = await this.getDataForMessagingTab();
		return reply({ success: true, threads });
	}

	/*
	 * Send a full thread to the client that's requesting it.
	 */
	async threadPull (socket, data, reply) {

		// Make sure the client passed in safe values.
		const itemId = String(data.itemId);

		const recUser = await this.database.get(`User`, { _id: itemId });
		const thread = await this.buildThread(recUser);

		return reply({ success: true, thread });

	}

	/*
	 * Constructs a thread object that we can send to clients.
	 */
	async buildThread (recUser) {

		// Get the last 100 messages for this user.
		const recMessages = await this.database.find(`Message`, {
			_user: recUser._id,
		}, {
			limit: config.maxOldThreadMessages,
			sort: { sentAt: `desc` },
		});

		// Order them with the oldest first, newest last.
		recMessages.reverse();

		// Prepare messages.
		const messages = recMessages.map(recMessage =>
			Object({
				messageId: recMessage._id.toString(),
				direction: recMessage.direction,
				sentAt: recMessage.sentAt,
				humanToHuman: recMessage.humanToHuman,
				data: recMessage.data,
			})
		);

		// Get the most recent incoming message.
		let lastIncomingMessage;

		for (let index = messages.length - 1; index >= 0; index--) {
			const message = messages[index];

			if (message.direction === `incoming`) {
				lastIncomingMessage = message;
				break;
			}
		}

		// Construct the thread.
		const adminLastReadMessages = moment((recUser.appData && recUser.appData.adminLastReadMessages) || 0);
		const { latestMessage, latestDate } = getLatestMessageInformation(lastIncomingMessage);

		return Object({
			itemId: recUser._id,
			userFullName: `${recUser.profile.firstName} ${recUser.profile.lastName}`.trim(),
			messages,
			latestMessage,
			latestDate,
			botEnabled: !(recUser.bot && recUser.bot.disabled),
			adminLastReadMessages: adminLastReadMessages.toISOString(),
		});

	}

	/*
	 * Update the "bot.disabled" property on the user's document.
	 */
	async threadSetBotEnabled (socket, data, reply) {

		// Make sure the client passed in safe values.
		const itemId = String(data.itemId);
		const botDisabled = Boolean(!data.enabled);

		await this.database.update(`User`, itemId, {
			'bot.disabled': botDisabled,
		});

		return reply({ success: true });

	}

	/*
	 * Update the "adminLastReadMessages" property on the user's document.
	 */
	async threadSetAdminReadDate (socket, data, reply) {

		// Make sure the client passed in safe values.
		const itemId = String(data.itemId);
		const lastRead = moment(data.lastRead).toDate();

		await this.database.update(`User`, itemId, {
			'appData.adminLastReadMessages': lastRead,
		});

		return reply({ success: true });

	}

	/*
	 * Send an admin message to the given user.
	 */
	async threadSendMessage (socket, data, reply) {

		// Make sure the client passed in safe values.
		const itemId = String(data.itemId);
		const text = String(data.messageText);

		const req = new RequestNinja(this.hippocampUrl, {
			timeout: (1000 * 30),
			returnResponseObject: true,
		});

		const res = await req.postJson({
			fromAdmin: true,
			messages: [{
				userId: itemId,
				channelName: `facebook`,
				direction: `outgoing`,
				text,
			}],
		});

		if (res.statusCode !== 200) {
			throw new Error(`Non 200 HTTP status code "${res.statusCode}" returned by Hippocamp.`);
		}

		if (!res.body || !res.body.success) { throw new Error(`Hippocamp returned an error: "${res.body.error}".`); }

		return reply({ success: true });

	}

};
