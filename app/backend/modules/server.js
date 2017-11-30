'use strict';

/*
 * SERVER
 */

const packageJson = require(`../../../package.json`);
const config = require(`config-ninja`).use(`eyewitness-ui`);

const path = require(`path`);
const http = require(`http`);
const bodyParser = require(`body-parser`);
const compression = require(`compression`);
const cookieParser = require(`cookie-parser`);
const express = require(`express`);
const basicAuth = require(`express-basic-auth`);
const exphbs = require(`express-handlebars`);
const socketio = require(`socket.io`);
const HomeController = require(`../controllers/home`);
const middleware = require(`./middleware`);
const { mapListToDictionary } = require(`./utilities`);

/*
 * Starts the server on the given port.
 */
async function start (port, database) {

	const app = express();

	const webServer = setupWebSocketServer(app, database);
	setupServerViewEngine(app);
	setupServerMiddleware(app);
	setupServerRoutes(app);
	setupServerErrorHandling(app);

	// Start listening on the HTTP web server.
	await new Promise((resolve, reject) =>
		webServer.listen(port, err => (err ? reject(err) : resolve()))
	);

}

/*
 * Sets up web sockets.
 */
function setupWebSocketServer (app, database) {

	const webServer = new http.Server(app);
	const socketServer = socketio(webServer);

	socketServer.on(`connection`, async socket => {

		// Query the database.
		const recUsers = await database.find(`User`, {}, {
			sort: { 'conversation.lastMessageSentAt': `desc` },
		});

		const recArticles = await database.find(`Article`, {}, {
			sort: { articleDate: `desc` },
		});

		const recWelcomeMessages = await database.find(`WelcomeMessage`, {}, {
			sort: { weight: `asc` },
		});

		// Prepare threads.
		const threadPromises = recUsers.map(async recUser => {

			// Get the last 100 messages for this user.
			const recMessages = await database.find(`Message`, {
				_user: recUser._id,
			}, {
				limit: 100,
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
				latestMessage: lastIncomingMessage.data.text || `[No Text]`,
				latestDate: lastIncomingMessage.sentAt || null,
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
		socket.emit(`welcome`, {
			threads: mapListToDictionary(threads, `threadId`),
			articles: mapListToDictionary(articles, `articleId`),
			showStories: true,
			welcomeMessages: mapListToDictionary(welcomeMessages, `welcomeMessageId`),
		});

		socket.on(`thread/set-bot-enabled`, async (data, reply) => {

			try {

				await database.update(`User`, data.threadId, {
					bot: { disabled: !data.enabled },
				});

			}
			catch (err) {
				return reply({ success: false, error: err.message });
			}

			return reply({ success: true });

		});

		socket.on(`thread/send-message`, async (data, reply) => {
			console.log(`Thread Send Message`, data);
		});

		socket.on(`article/set-published`, async (data, reply) => {

			try {

				// Make sure the client passed in safe values.
				const articleId = String(data.articleId);
				const isPublished = Boolean(data.published);

				await database.update(`Article`, articleId, { isPublished });

			}
			catch (err) {
				return reply({ success: false, error: err.message });
			}

			return reply({ success: true });

		});

		socket.on(`breaking-news/send-message`, async (data, reply) => {
			console.log(`Breaking News Send Message`, data);
		});

		socket.on(`settings/set-bot-enabled`, async (data, reply) => {

			try {

				// Make sure the client passed in safe values.
				const isBotEnabled = Boolean(data.enabled);

				const recSettings = await database.find(`Settings`, {})[0];
				await database.update(`Settings`, recSettings, { isBotEnabled });

			}
			catch (err) {
				return reply({ success: false, error: err.message });
			}

			return reply({ success: true });

		});

		socket.on(`welcome-message/update`, async (data, reply) => {

			try {

				// Get the welcome message to update.
				let recWelcomeMessage = await database.get(`WelcomeMessage`, { _id: data.welcomeMessageId });

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
				await database.update(`WelcomeMessage`, data.welcomeMessageId, recWelcomeMessage, { upsert: true });

			}
			catch (err) {
				return reply({ success: false, error: err.message });
			}

			return reply({ success: true });

		});

		socket.on(`welcome-message/remove`, async (data, reply) => {

			try {

				// Update the database.
				await database.delete(`WelcomeMessage`, data.welcomeMessageId);

			}
			catch (err) {
				return reply({ success: false, error: err.message });
			}

			return reply({ success: true });

		});

	});

	return webServer;

}

/*
 * Configure the view engine.
 */
function setupServerViewEngine (app) {

	app.set(`views`, path.join(__dirname, `..`, `..`, `frontend`, `build`, `views`));

	app.engine(`.handlebars.html`, exphbs({
		extname: `.handlebars.html`,
		compilerOptions: {
			preventIndent: true,
		},
		helpers: {

		},
	}));

	app.set(`view engine`, `.handlebars.html`);

}

/*
 * Add all of the routes.
 */
function setupServerMiddleware (app) {

	// General middleware.
	app.use(compression({ threshold: 0 }));
	app.use(cookieParser(config.authentication.cookie.secret));
	app.use(bodyParser.urlencoded({ // This will let us get the data from a POST.
		extended: true,
	}));
	app.use(bodyParser.json());

	// Static files (must come before logging to avoid logging out every request for a static file e.g. favicon).
	const staticDirectory = path.resolve(__dirname, `..`, `..`, `frontend`, `build`, `static`);
	app.use(`/public`, express.static(staticDirectory));

	// Temporary favicon.
	app.use(`/favicon.ico`, (req, res) => res.status(404).end(`NOT_ADDED_YET`));

	// Health check endpoint.
	app.use(`/health-check`, middleware.healthCheck);

	// Redirect to HTTPS.
	app.use(middleware.enforceHttps);

	// Authentication.
	app.use(basicAuth({
		users: config.authentication.basicAuth.users,
		challenge: true,
		realm: packageJson.name,
	}));

}

/*
 * Add all of the routes.
 */
function setupServerRoutes (app) {

	const ctrlHome = new HomeController();
	app.get(`*`, ctrlHome.renderHomePage.bind(ctrlHome));

}

/*
 * Add all the error handling middleware which must go after the routes.
 */
function setupServerErrorHandling (app) {

	app.use(middleware.handleErrors);

}

/*
 *
 */
module.exports = {
	start,
};
