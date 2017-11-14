/*
 * FRONTEND ENTRY POINT
 */

/* eslint-disable node/no-unpublished-require */

import 'normalize.css';
import '../styles/main.scss';

import Vue from 'vue';
import App from '../vue/App';

new Vue({
	el: `#app`,  // eslint-disable-line id-length
	render: createElement => createElement(App),
});
