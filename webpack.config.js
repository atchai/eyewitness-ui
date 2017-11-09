'use strict';

/*
 * WEBPACK CONFIG
 */

const path = require(`path`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const CleanWebpackPlugin = require(`clean-webpack-plugin`);

const BASE_PATH = path.resolve(__dirname, `app`, `frontend`);

module.exports = {

	entry: {
		app: path.join(BASE_PATH, `source`, `scripts`, `app.js`),
	},

	plugins: [
		new CleanWebpackPlugin([`dist`]),
		new HtmlWebpackPlugin({
			title: `{{pageTitle}}`,
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
	],

	output: {
		filename: `[name].bundle.js`,
		path: path.join(BASE_PATH, `build`, `scripts`),
	},

};
