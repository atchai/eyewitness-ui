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

		const recUsers = await database.find(`User`, {});
		const recArticles = await database.find(`Article`, {});

		const threadPromises = recUsers.map(async recUser => {

			const recLatestMessage = await database.get(`Message`, {
				_user: recUser._id,
				direction: `incoming`,
				human: { $ne: false },
			}, {
				limit: 1,
				sort: { sentAt: `desc` },
			});

			return Object({
				threadId: recUser._id,
				userFullName: `${recUser.profile.firstName} ${recUser.profile.lastName}`.trim(),
				latestMessage: recLatestMessage.data.text || `[No Text]`,
				latestDate: recLatestMessage.sentAt,
			});

		});

		const threads = await Promise.all(threadPromises);

		const articles = recArticles.map(recArticle => Object({
			articleId: recArticle._id,
			title: recArticle.title,
			articleUrl: recArticle.articleUrl,
			articleDate: recArticle.articleDate,
			priority: (typeof recArticle.isPriority !== `undefined` ? recArticle.isPriority : false),
			published: (typeof recArticle.isPublished !== `undefined` ? recArticle.isPublished : true),
		}));

		socket.emit(`welcome`, {
			threads: mapListToDictionary(threads, `threadId`),
			articles: mapListToDictionary(articles, `articleId`),
			settings: {
				showStories: true,
				welcomeMessages: [],
			},
		});

	});

	socketServer.on(`thread/send-message`, data => {
		console.log(`Thread Send Message`, data);
	});

	socketServer.on(`article/set-published`, async (data, reply) => {

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

	socketServer.on(`breaking-news/send-message`, data => {
		console.log(`Breaking News Send Message`, data);
	});

	socketServer.on(`settings/save-message`, data => {
		console.log(`Settings Save Message`, data);
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
