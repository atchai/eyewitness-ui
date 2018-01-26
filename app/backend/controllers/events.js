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
			const thread = {
				itemId: recUser._id.toString(),
				latestDate: recUser.conversation.lastMessageReceivedAt,
				conversationState: recUser.appData.conversationState || `closed`,
			};

			// Full-fat threads contain all properties.
			if (index < pageInitialSize) {
				const adminLastReadMessages = moment((recUser.appData && recUser.appData.adminLastReadMessages) || 0);
				const firstName = recUser.profile.firstName || ``;
				const lastName = recUser.profile.lastName || ``;

				thread.isFullFat = true;
				thread.userFullName = `${firstName} ${lastName}`.trim() || `[Name Hidden]`;
				thread.profilePicUrl = recUser.profile.profilePicUrl;
				thread.enquiryType = recUser.appData.enquiryType || null;
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

		// Get latest message for each full-fat thread outside of for-loop to improve performance.
		const latestMessagePromises = threads.map(async thread => {
			if (thread.isFullFat) {
				thread.latestMessage = await this.getLatestThreadMessage(thread.itemId);
			}
		});

		await Promise.all(latestMessagePromises);

		// We must sort threads by their latest message date.
		deepSort(threads, `latestDate`, `desc`);

		return mapListToDictionary(threads, `itemId`);

	}

	/*
	 * Prepares a single thread.
	 */
	async prepareSingleThread (recUser) {
		const threads = await this.prepareThreads([ recUser ], 1);
		return Object.values(threads)[0];
	}

	/*
	 * Prepares message data for the frontend and maps the list to a dictionary.
	 */
	async prepareMessages (recMessages, pageInitialSize, isHardLimit = false) {

		const messages = [];

		for (let index = 0; index < recMessages.length; index++) {
			const recMessage = recMessages[index];
			const message = { itemId: recMessage._id.toString() };

			// Full-fat messages contain all properties.
			if (index < pageInitialSize) {
				message.isFullFat = true;
				message.direction = recMessage.direction;
				message.sentAt = moment(recMessage.sentAt).toISOString();
				message.humanToHuman = recMessage.humanToHuman;
				message.data = recMessage.data;
			}

			// Don't add any low-fat messages if we have a hard limit.
			else if (isHardLimit) {
				break;
			}

			// Low-fat messages only contain the item ID.
			else {
				message.isFullFat = false;
			}

			messages.push(message);
		}

		// We must sort messages by date with newest last.
		deepSort(messages, `sentAt`, `asc`);

		return mapListToDictionary(messages, `itemId`);

	}

	/*
	 * Prepares story data for the frontend and maps the list to a dictionary.
	 */
	async prepareStories (recArticles, pageInitialSize, isHardLimit = false) {

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
	async prepareWelcomeMessages (recWelcomeMessages) {

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
	async getItems (modelName, sortField = null, sortDirection = null, conditions = {}, hardLimit = false) {

		const options = {};

		if (sortField && sortDirection) {
			options.sort = { [sortField]: sortDirection };
		}

		if (hardLimit) {
			options.limit = hardLimit;
		}

		const records = await this.database.find(modelName, conditions, options);

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
			records = await this.getItems(`User`, `conversation.lastMessageReceivedAt`, `desc`);
		}

		const threads = await this.prepareThreads(records, data.pageInitialSize);

		return reply({
			success: true,
			threads,
		});

	}

	/*
	 * Send a full thread to the client that's requesting it.
	 */
	async messagingThreadGetInfo (socket, data, reply) {

		// Make sure the client passed in safe values.
		const itemId = String(data.itemId);

		const recUser = await this.database.get(`User`, { _id: itemId });
		const thread = await this.prepareSingleThread(recUser);

		return reply({ success: true, thread });

	}

	/*
	 * Returns the list of messages for the given thread.
	 */
	async messagingThreadGetMessages (socket, data, reply) {

		let records;

		// Get the relevant message records.
		if (data.breakPointMessageId) {
			records = await this.getItems(`Message`, `sentAt`, `desc`, {
				_id: { $lt: data.breakPointMessageId },
				_user: data.threadId,
			}, data.pageInitialSize);
		}
		else {
			records = await this.getItems(`Message`, `sentAt`, `desc`, {
				_user: data.threadId,
			}, data.pageInitialSize);
		}

		const messages = await this.prepareMessages(records, data.pageInitialSize, true);

		return reply({
			success: true,
			messages,
		});

	}

	/*
	 * Update the "bot.disabled" property on the user's document.
	 */
	async messagingThreadSetBotEnabled (socket, data, reply) {

		// Make sure the client passed in safe values.
		const itemId = String(data.itemId);
		const botDisabled = Boolean(!data.enabled);

		await this.database.update(`User`, itemId, {
			'bot.disabled': botDisabled,
		});

		return reply({ success: true });

	}

	/*
	 * Update the "conversationState" property on the user's document.
	 */
	async messagingThreadSetState (socket, data, reply) {

		// Make sure the client passed in safe values.
		const itemId = String(data.itemId);
		const conversationState = String(data.conversationState);
		const allowedConversationStates = [ `open`, `closed` ];

		if (!allowedConversationStates.includes(conversationState)) {
			throw new Error(`Invalid conversation state "${conversationState}".`);
		}

		await this.database.update(`User`, itemId, {
			'appData.conversationState': conversationState,
			'bot.disabled': false,
		});

		return reply({ success: true });

	}

	/*
	 * Update the "adminLastReadMessages" property on the user's document.
	 */
	async messagingThreadSetAdminReadDate (socket, data, reply) {

		// Make sure the client passed in safe values.
		const itemId = String(data.itemId);

		const recUser = await this.database.get(`User`, { _id: itemId });
		const lastRead = Math.max(recUser.conversation.lastMessageReceivedAt, recUser.conversation.lastMessageSentAt);

		await this.database.update(`User`, itemId, {
			'appData.adminLastReadMessages': lastRead,
		});

		return reply({ success: true });

	}

	/*
	 * Send an admin message to the given user.
	 */
	async messagingThreadSendMessage (socket, data, reply) {

		// Make sure the client passed in safe values.
		const itemId = String(data.itemId);
		const text = String(data.messageText);

		// Send the message to Hippocamp which will disable the bot.
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

		// Manually re-open the conversation.
		await this.database.update(`User`, itemId, {
			'appData.conversationState': `open`,
		});

		return reply({ success: true });

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

		const stories = await this.prepareStories(records, data.pageInitialSize);

		return reply({
			success: true,
			stories,
		});

	}

	/*
	 * Update the "isPriority" property of the given story.
	 */
	async storiesSetStoryPriority (socket, data, reply) {

		// Make sure the client passed in safe values.
		const itemId = String(data.itemId);
		const isPriority = Boolean(data.priority);

		// Update the database.
		await this.database.update(`Article`, itemId, { isPriority });

		return reply({ success: true });

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
		const welcomeMessages = await this.prepareWelcomeMessages(records);

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

};
