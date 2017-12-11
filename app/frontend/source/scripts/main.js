/*
 * FRONTEND ENTRY POINT
 */

/*
 * Import the styles.
 */
import 'normalize.css';
import '../styles/main.scss';

/*
 * Import dependencies.
 */
import dialogPolyfill from 'dialog-polyfill';
import Vue from 'vue';
import router from './router';
import store from './store';
import { setupWebSocketClient } from './webSocketClient';
import './filters';

/*
 * Import the application components.
 */
import App from '../components/App';

/*
 * Connect to the socket server.
 */
setupWebSocketClient(store);

/*
 * Prevent drag events on certain elements.
 */
document.ondragstart = event => {
	const tagName = event.target.tagName.toUpperCase();
	if ([`A`, `IMG`].includes(tagName) || !event.target.className.match(/(?:^|\s)no-drag(?:\s|$)/i)) { return false; }
	return true;
};

/*
 * Create a new Vue application instance.
 */
new Vue({
	el: `#app`, // eslint-disable-line id-length
	router,
	store,
	render: createElement => createElement(App), // We must use render because we don't bundle in the Vue compiler.
});
