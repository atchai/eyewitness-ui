'use strict';

/*
 * WEBPACK CONFIG
 */

const path = require(`path`);
const config = require(`config-ninja`).init(`eyewitness-ui`, path.resolve(__dirname, `app`, `config`));

const CleanWebpackPlugin = require(`clean-webpack-plugin`);
const ExtractTextPlugin = require(`extract-text-webpack-plugin`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const webpack = require(`webpack`);

const BASE_PATH = path.resolve(__dirname, `app`, `frontend`);

const extractSass = new ExtractTextPlugin({
	filename: `[name].bundle.css`,
	disable: config.build.useStyleLoader,
});

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
				collapseWhitespace: true,
				decodeEntities: true,
				minifyCSS: true,
				minifyJS: true,
				minifyURLs: true,
				quoteCharacter: `"`,
				removeAttributeQuotes: true,
				removeComments: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				sortAttributes: true,
				sortClassName: true,
			},
			hash: true,
			cache: false,
		}),
		extractSass,
	],

	module: {
		rules: [

			// SASS.
			{
				test: /\.scss$/,
				use: extractSass.extract({
					use: [{
						loader: `css-loader`,
						options: {
							sourceMap: true,
						},
					}, {
						loader: `sass-loader`,
						options: {
							sourceMap: true,
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
