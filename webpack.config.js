'use strict';

/*
 * WEBPACK CONFIG
 */

/* eslint-disable node/no-unpublished-require */

const path = require(`path`);
const config = require(`config-ninja`).init(`eyewitness-ui`, path.resolve(__dirname, `app`, `config`));

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

const extractCssFromModules = new ExtractTextPlugin({
	filename: `[name].styles.modules.css`,
	disable: config.build.useStyleLoader,
});

/*
 * The Webpack configuration.
 */
module.exports = {

	context: path.resolve(BASE_PATH),

	target: `web`,

	stats: config.build.webpackStats,

	devtool: `source-map`,

	entry: {
		app: path.join(BASE_PATH, `source`, `scripts`, `app.js`),
	},

	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify(config.env.id),
			},
		}),
		new CleanWebpackPlugin([`./app/frontend/build/static`, `./app/frontend/build/views`], {
			verbose: true,
			exclude: [`.gitkeep`],
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
		extractCssFromModules,
		extractSassFromApp,
	],

	module: {
		rules: [

			// BABEL from app.
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: `babel-loader`,
					options: {
						presets: [
							[`env`, {}],
							[`minify`, {}],
						],
						minified: config.build.compressJs,
					},
				},
			},

			// CSS from modules.
			{
				test: /\.css$/,
				// exclude: /node_modules/,  // <- Don't exclude node_modules because it contains normalise.css.
				use: extractCssFromModules.extract({
					use: [{
						loader: `css-loader`,
						options: {
							minimize: config.build.compressCss,
						},
					}],
					fallback: {
						loader: `style-loader`,
					},
				}),
			},

			// SASS from app.
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: extractSassFromApp.extract({
					use: [{
						loader: `css-loader`,
						options: {
							sourceMap: true,
							minimize: config.build.compressCss,
						},
					}, {
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
					}, {
						loader: `sass-loader`,
						options: {
							outputStyle: config.build.sassOutputStyle,
							precision: 3,
							sourceComments: config.build.sassSourceComments,
							sourceMap: true,
							sourceMapContents: true,
							sourceMapEmbed: true,
						},
					}],
					fallback: {
						loader: `style-loader`,
						options: {
							sourceMap: true,
							convertToAbsoluteUrls: true,
							hmr: true,
						},
					},
				}),
			},

		],
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
