'use strict';

/*
 * CONTROLLER: Events
 */

const config = require(`config-ninja`).use(`eyewitness-ui`);

const moment = require(`moment`);
const RequestNinja = require(`request-ninja`);
const { mapListToDictionary, getLatestMessageInformation } = require(`../modules/utilities`);

module.exports = class EventsController {

	constructor (database) {

		this.database = database;
		this.hippocampUrl = `${config.hippocampServer.baseUrl}/api/adapter/web`;

	}

	/*
	 * Sends the welcome event to a new client.
	 */
	async emitWelcomeEvent (socket) {

		// Query the database.
		const recUsers = await this.database.find(`User`, {}, {
			sort: { 'conversation.lastMessageSentAt': `desc` },
			limit: config.maxListSize,
		});

		const recArticles = await this.database.find(`Article`, {}, {
			sort: { articleDate: `desc` },
			limit: config.maxListSize,
		});

		const recWelcomeMessages = await this.database.find(`WelcomeMessage`, {}, {
			sort: { weight: `asc` },
		});

		// Prepare threads.
		const threadPromises = recUsers.map(recUser => this.buildThread(recUser));
		const threads = await Promise.all(threadPromises);

		// Prepare articles.
		const articles = recArticles.map(recArticle => Object({
			articleId: recArticle._id,
			title: recArticle.title,
			articleUrl: recArticle.articleUrl,
			articleDate: recArticle.articleDate,
			priority: (typeof recArticle.isPriority !== `undefined` ? recArticle.isPriority : false),
			published: (typeof recArticle.isPublished !== `undefined` ? recArticle.isPublished : true),
		}));

		// Prepare welcome messages.
		const welcomeMessages = recWelcomeMessages.map(recWelcomeMessage => Object({
			welcomeMessageId: recWelcomeMessage._id,
			text: recWelcomeMessage.text,
			weight: recWelcomeMessage.weight,
		}));

		// Push data to client.
		socket.emit(`welcome`, {
			threads: mapListToDictionary(threads, `threadId`),
			articles: mapListToDictionary(articles, `articleId`),
			showStories: true,
			welcomeMessages: mapListToDictionary(welcomeMessages, `welcomeMessageId`),
			maxOldThreadMessages: config.maxListSize,
		});

	}

	/*
	 * Send a full thread to the client that's requesting it.
	 */
	async threadPull (socket, data, reply) {

		// Make sure the client passed in safe values.
		const threadId = String(data.threadId);

		const recUser = await this.database.get(`User`, { _id: threadId });
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
			threadId: recUser._id,
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
		const threadId = String(data.threadId);
		const botDisabled = Boolean(!data.enabled);

		await this.database.update(`User`, threadId, {
			'bot.disabled': botDisabled,
		});

		return reply({ success: true });

	}

	/*
	 * Update the "adminLastReadMessages" property on the user's document.
	 */
	async threadSetAdminReadDate (socket, data, reply) {

		// Make sure the client passed in safe values.
		const threadId = String(data.threadId);
		const lastRead = moment(data.lastRead).toDate();

		await this.database.update(`User`, threadId, {
			'appData.adminLastReadMessages': lastRead,
		});

		return reply({ success: true });

	}

	/*
	 * Send an admin message to the given user.
	 */
	async threadSendMessage (socket, data, reply) {

		// Make sure the client passed in safe values.
		const threadId = String(data.threadId);
		const text = String(data.messageText);

		const req = new RequestNinja(this.hippocampUrl, {
			timeout: (1000 * 30),
			returnResponseObject: true,
		});

		const res = await req.postJson({
			fromAdmin: true,
			messages: [{
				userId: threadId,
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

	/*
	 * Update the "isPublished" property of the given article.
	 */
	async articleSetPublished (socket, data, reply) {

		// Make sure the client passed in safe values.
		const articleId = String(data.articleId);
		const isPublished = Boolean(data.published);

		// Update the database.
		await this.database.update(`Article`, articleId, { isPublished });

		return reply({ success: true });

	}

	/*
	 * Send a broadcast message to all users.
	 */
	async breakingNewsSendMessage (socket, data, reply) {

		console.log(`Breaking News Send Message`, data);

		return reply({ success: true });

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
	async welcomeMessageUpdate (socket, data, reply) {

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
	async welcomeMessageRemove (socket, data, reply) {

		// Make sure the client passed in safe values.
		const welcomeMessageId = String(data.welcomeMessageId);

		// Update the database.
		await this.database.delete(`WelcomeMessage`, welcomeMessageId);

		return reply({ success: true });

	}

};
