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
const EventsController = require(`../controllers/events`);
const WebhooksController = require(`../controllers/webhooks`);
const middleware = require(`./middleware`);
const { handleSocketEvent } = require(`./utilities`);

/*
 * Starts the server on the given port.
 */
async function start (port, database) {

	const app = express();

	const { webServer, socketServer } = setupWebSocketServer(app, database);
	setupServerViewEngine(app);
	setupServerMiddleware(app);
	setupServerRoutes(app, socketServer);
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
	const ctrlEvents = new EventsController(database);

	socketServer.on(`connection`, async socket => {

		await ctrlEvents.emitWelcomeEvent(socket);

		socket.on(
			`stories/pull-tab-data`,
			handleSocketEvent.bind(ctrlEvents, socket, ctrlEvents.getStoryTabData)
		);

		socket.on(
			`messaging/pull-tab-data`,
			handleSocketEvent.bind(ctrlEvents, socket, ctrlEvents.messagingPullTabData)
		);
		socket.on(
			`thread/pull`,
			handleSocketEvent.bind(ctrlEvents, socket, ctrlEvents.threadPull)
		);
		socket.on(
			`thread/set-bot-enabled`,
			handleSocketEvent.bind(ctrlEvents, socket, ctrlEvents.threadSetBotEnabled)
		);
		socket.on(
			`thread/set-admin-read-date`,
			handleSocketEvent.bind(ctrlEvents, socket, ctrlEvents.threadSetAdminReadDate)
		);
		socket.on(
			`thread/send-message`,
			handleSocketEvent.bind(ctrlEvents, socket, ctrlEvents.threadSendMessage)
		);
		socket.on(
			`article/set-published`,
			handleSocketEvent.bind(ctrlEvents, socket, ctrlEvents.articleSetPublished)
		);
		socket.on(
			`settings/pull-tab-data`,
			handleSocketEvent.bind(ctrlEvents, socket, ctrlEvents.settingsPullTabData)
		);
		socket.on(
			`settings/set-bot-enabled`,
			handleSocketEvent.bind(ctrlEvents, socket, ctrlEvents.settingsSetBotEnabled)
		);
		socket.on(
			`welcome-message/update`,
			handleSocketEvent.bind(ctrlEvents, socket, ctrlEvents.welcomeMessageUpdate)
		);
		socket.on(
			`welcome-message/remove`,
			handleSocketEvent.bind(ctrlEvents, socket, ctrlEvents.welcomeMessageRemove)
		);

	});

	return { webServer, socketServer };

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
		unauthorizedResponse: req => JSON.stringify({
			success: false,
			error: (req.auth ? `Invalid credentials.` : `No credentials provided.`),
		}),
	}));

}

/*
 * Add all of the routes.
 */
function setupServerRoutes (app, socketServer) {

	const ctrlWebhooks = new WebhooksController(socketServer);
	app.post(`/webhooks/new-message`, ctrlWebhooks.newMessage.bind(ctrlWebhooks));

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
