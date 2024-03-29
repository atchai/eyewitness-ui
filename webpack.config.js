'use strict';

/*
 * WEBPACK CONFIG
 */

/* eslint-disable node/no-unpublished-require */

const path = require(`path`);
const packageJson = require(`./package.json`);

const config = require(`config-ninja`).init(`eyewitness-ui-config`, `./app/config`, {
	environmentVariables: {
		enableDotenv: (process.env.NODE_ENV === `development`),
		dotenvPath: path.join(__dirname, `.env`),
		mapping: {
			DB_MONGO_CONNECTION_STR: `databases.mongo.connectionString`,
			AUTH_COOKIE_SECRET: `authentication.cookie.secret`,
			USER_PWD_BOT: `authentication.basicAuth.users.bot`,
			USER_PWD_ADMIN: `authentication.basicAuth.users.admin`,
			FB_PAGE_ID: `facebookPageId`,
			UI_SERVER_URI: `server.externalUri`,
			BOT_SERVER_URI: `hippocampServer.baseUrl`,
			BOT_SERVER_ACCESS_TOKEN: `hippocampServer.accessToken`,
			AWS_S3_ACCESS_KEY_ID: `amazonS3.accessKeyId`,
			AWS_S3_SECRET_ACCESS_KEY: `amazonS3.secretAccessKey`,
			AWS_S3_REGION: `amazonS3.region`,
			AWS_S3_BUCKET: `amazonS3.bucketName`,
			AWS_S3_KEY_PREFIX: `amazonS3.keyPrefix`,
		},
	},
});

const autoprefixer = require(`autoprefixer`);
const CleanWebpackPlugin = require(`clean-webpack-plugin`);
const ExtractTextPlugin = require(`extract-text-webpack-plugin`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const NpmInstallPlugin = require(`npm-install-webpack-plugin`);
const webpack = require(`webpack`);
const UglifyJsPlugin = require(`uglifyjs-webpack-plugin`);

const BASE_PATH = path.resolve(__dirname, `app`, `frontend`);

/*
 * Config for extracting CSS text to files.
 */
const extractSassFromApp = new ExtractTextPlugin({
	filename: `[name].styles.sass.css`,
	disable: config.build.useStyleLoader,
});

const extractSassFromVue = new ExtractTextPlugin({
	filename: `[name].styles.vue.css`,
	disable: config.build.useStyleLoader,
});

const extractCssFromModules = new ExtractTextPlugin({
	filename: `[name].styles.modules.css`,
	disable: config.build.useStyleLoader,
});

/*
 * Config for the Babel loader.
 */
const LOADER_BABEL = {
	loader: `babel-loader`,
	options: {
		presets: [
			[ `babel-preset-env`, {
				targets: { browsers: packageJson.browserslist },
			}],
			// [ `minify`, {}], <-- causing errors in compiled JS.
		],
		plugins: [
			`syntax-dynamic-import`,
			`transform-object-rest-spread`,
			`transform-runtime`,
		],
		minified: config.build.compressJs,
	},
};

/*
 * Config for the Style loader.
 */
const LOADER_STYLE = {
	loader: `style-loader`,
	options: {
		sourceMap: true,
		convertToAbsoluteUrls: true,
		hmr: true,
	},
};

/*
 * Config for the CSS loader.
 */
const LOADER_CSS = {
	loader: `css-loader`,
	options: {
		sourceMap: true,
		minimize: config.build.compressCss,
	},
};

/*
 * Config for the PostCSS loader.
 */
const LOADER_POSTCSS = {
	loader: `postcss-loader`,
	options: {
		sourceMap: true,
		plugins: [
			autoprefixer({
				env: config.env.id,
				remove: false,
			}),
		],
	},
};

/*
 * Config for the SASS loader.
 */
const LOADER_SASS = {
	loader: `sass-loader`,
	options: {
		outputStyle: config.build.sassOutputStyle,
		precision: 3,
		sourceComments: config.build.sassSourceComments,
		sourceMap: true,
		sourceMapContents: true,
		sourceMapEmbed: true,
	},
};

/*
 * Config for the SASS resources loader.
 */
const LOADER_SASS_RESOURCES = {
	loader: `sass-resources-loader`,
	options: {
		resources: [
			path.resolve(__dirname, `app`, `frontend`, `source`, `styles`, `variables.scss`),
		],
	},
};

/*
 * The Webpack configuration.
 */
module.exports = {

	context: path.resolve(BASE_PATH),

	target: `web`,

	stats: config.build.webpackStats,

	devtool: config.build.sourceMapMode,

	entry: {
		app: path.join(BASE_PATH, `source`, `scripts`, `main.js`),
	},

	plugins: [
		new NpmInstallPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(config.env.id),
				SERVER_URI: JSON.stringify(config.server.externalUri),
			},
		}),
		new CleanWebpackPlugin([ `./app/frontend/build/static`, `./app/frontend/build/views` ], {
			verbose: true,
			exclude: [ `.gitkeep` ],
		}),
		new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.optimize.CommonsChunkPlugin({
			name: `common-modules`,
		}),
		new UglifyJsPlugin({
			parallel: true,
			sourceMap: Boolean(config.build.sourceMapMode),
			uglifyOptions: {
				ecma: 8,
				ie8: false,
				safari10: false,
				warnings: true,
			},
		}),
		new HtmlWebpackPlugin({
			filename: path.join(BASE_PATH, `build`, `views`, `home.handlebars.html`),
			template: path.join(BASE_PATH, `source`, `views`, `home.handlebars.html`),
			inject: true,
			minify: {
				collapseBooleanAttributes: true,
				collapseInlineTagWhitespace: true,
				collapseWhitespace: config.build.compressHtml,
				decodeEntities: true,
				minifyCSS: config.build.compressCss,
				minifyJS: config.build.compressJs,
				minifyURLs: true,
				quoteCharacter: `"`,
				removeAttributeQuotes: true,
				removeComments: config.build.compressHtml,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				sortAttributes: config.build.compressHtml,
				sortClassName: config.build.compressHtml,
			},
			hash: true,
			cache: false,
		}),
		extractSassFromApp,
		extractSassFromVue,
		extractCssFromModules,
	],

	module: {
		rules: [

			// VUE components.
			{
				test: /\.vue$/,
				exclude: /node_modules/,
				use: {
					loader: `vue-loader`,
					options: {
						loaders: {
							js: [ LOADER_BABEL ], // eslint-disable-line id-length
							sass: extractSassFromVue.extract({
								use: [ LOADER_CSS, LOADER_SASS, LOADER_SASS_RESOURCES ],
								fallback: `vue-style-loader`,
							}),
						},
						postcss: LOADER_POSTCSS.options.plugins,
					},
				},
			},

			// JavaScript from app.
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: LOADER_BABEL,
			},

			// CSS from modules.
			{
				test: /\.css$/,
				// exclude: /node_modules/,  // <- Don't exclude node_modules because it contains normalise.css.
				use: extractCssFromModules.extract({
					use: [ LOADER_CSS ],
					fallback: LOADER_STYLE,
				}),
			},

			// SASS from app.
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: extractSassFromApp.extract({
					use: [ LOADER_CSS, LOADER_POSTCSS, LOADER_SASS ],
					fallback: LOADER_STYLE,
				}),
			},

		],
	},

	resolve: {
		extensions: [ `.js`, `.json`, `.vue` ],
	},

	output: {
		filename: `[name].bundle.js`,
		chunkFilename: `[name].bundle.js`,
		path: path.join(BASE_PATH, `build`, `static`),
		publicPath: `/public/`,
	},

	watchOptions: {
		ignored: /node_modules/,
	},

	performance: {
		hints: `warning`,
	},

};
