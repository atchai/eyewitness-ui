'use strict';

/*
 * CONTROLLER: Events
 */

const config = require(`config-ninja`).use(`eyewitness-ui`);

const RequestNinja = require(`request-ninja`);
const { mapListToDictionary } = require(`../modules/utilities`);

module.exports = class EventsController {

	constructor (database, socket) {

		this.database = database;
		this.socket = socket;
		this.hippocampUrl = `${config.hippocampServer.baseUrl}/api/adapter/web`;

	}

	/*
	 * Sends the welcome event to a new client.
	 */
	async emitWelcomeEvent () {

		// Query the database.
		const recUsers = await this.database.find(`User`, {}, {
			sort: { 'conversation.lastMessageSentAt': `asc` },
		});

		const recArticles = await this.database.find(`Article`, {}, {
			sort: { articleDate: `desc` },
		});

		const recWelcomeMessages = await this.database.find(`WelcomeMessage`, {}, {
			sort: { weight: `asc` },
		});

		// Prepare threads.
		const threadPromises = recUsers.map(async recUser => {

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

			return Object({
				threadId: recUser._id,
				userFullName: `${recUser.profile.firstName} ${recUser.profile.lastName}`.trim(),
				messages,
				latestMessage: (lastIncomingMessage && lastIncomingMessage.data.text) || `[No Text]`,
				latestDate: (lastIncomingMessage && lastIncomingMessage.sentAt) || null,
				botEnabled: !(recUser.bot && recUser.bot.disabled),
			});

		});

		const threads = await Promise.all(threadPromises);

		// Order threads by last incoming message.
		threads.sort((threadA, threadB) =>
			(threadA.latestDate > threadB.latestDate ? +1 : (threadA.latestDate < threadB.latestDate ? -1 : 0))
		);

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
		this.socket.emit(`welcome`, {
			threads: mapListToDictionary(threads, `threadId`),
			articles: mapListToDictionary(articles, `articleId`),
			showStories: true,
			welcomeMessages: mapListToDictionary(welcomeMessages, `welcomeMessageId`),
			maxOldThreadMessages: config.maxOldThreadMessages,
		});

	}

	/*
	 * Update the "bot.disabled" property on the user's document.
	 */
	async threadSetBotEnabled (data, reply) {

		await this.database.update(`User`, data.threadId, {
			bot: { disabled: !data.enabled },
		});

		return reply({ success: true });

	}

	/*
	 * Send an admin message to the given user.
	 */
	async threadSendMessage (data, reply) {

		const req = new RequestNinja(this.hippocampUrl, {
			timeout: (1000 * 30),
			returnResponseObject: true,
		});

		const res = await req.postJson({
			fromAdmin: true,
			messages: [{
				userId: data.threadId,
				channelName: `facebook`,
				direction: `outgoing`,
				text: data.messageText,
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
	async articleSetPublished (data, reply) {

		// Make sure the client passed in safe values.
		const articleId = String(data.articleId);
		const isPublished = Boolean(data.published);

		await this.database.update(`Article`, articleId, { isPublished });

		return reply({ success: true });

	}

	/*
	 * Send a broadcast message to all users.
	 */
	async breakingNewsSendMessage (data, reply) {

		console.log(`Breaking News Send Message`, data);

		return reply({ success: true });

	}

	/*
	 * Allow the bot to be turned on/off for all users.
	 */
	async settingsSetBotEnabled (data, reply) {

		// Make sure the client passed in safe values.
		const isBotEnabled = Boolean(data.enabled);

		const recSettings = await this.database.find(`Settings`, {})[0];
		await this.database.update(`Settings`, recSettings, { isBotEnabled });

		return reply({ success: true });

	}

	/*
	 * Upserts a welcome message.
	 */
	async welcomeMessageUpdate (data, reply) {

		// Get the welcome message to update.
		let recWelcomeMessage = await this.database.get(`WelcomeMessage`, { _id: data.welcomeMessageId });

		// If no welcome message exists lets create a new one.
		if (!recWelcomeMessage) {
			recWelcomeMessage = {
				_id: data.welcomeMessageId,
			};
		}

		// Update the record.
		recWelcomeMessage.text = data.text;
		recWelcomeMessage.weight = data.weight;

		// Update the database.
		await this.database.update(`WelcomeMessage`, data.welcomeMessageId, recWelcomeMessage, { upsert: true });

		return reply({ success: true });

	}

	/*
	 * Upserts a welcome message.
	 */
	async welcomeMessageRemove (data, reply) {

		// Update the database.
		await this.database.delete(`WelcomeMessage`, data.welcomeMessageId);

		return reply({ success: true });

	}

};
