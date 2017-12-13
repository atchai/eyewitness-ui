'use strict';

/*
 * WEBPACK CONFIG
 */

/* eslint-disable node/no-unpublished-require */

const path = require(`path`);
const providerId = process.env.PROVIDER_ID;
const loadProviderConfig = Boolean(providerId);
const env = process.env.NODE_ENV || `development`;
const localConfigName = path.join(`providers`, `${providerId}.${env}`);

const config = require(`config-ninja`).init(`eyewitness-ui`, path.join(__dirname, `app`, `config`), {
	localConfig: (localConfigName ? [ localConfigName ] : []),
	requireLocalConfig: loadProviderConfig,
});

const autoprefixer = require(`autoprefixer`);
const CleanWebpackPlugin = require(`clean-webpack-plugin`);
const ExtractTextPlugin = require(`extract-text-webpack-plugin`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const webpack = require(`webpack`);

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
			[ `env`, {}],
			// [ `minify`, {}], <-- causing errors in compiled JS.
		],
		plugins: [
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
		path: path.join(BASE_PATH, `build`, `static`),
		publicPath: `/public`,
	},

	watchOptions: {
		ignored: /node_modules/,
	},

	performance: {
		hints: `warning`,
	},

};
