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
import socketClient from 'socket.io-client';
import Vue from 'vue';
import router from './router';
import store from './store';

/*
 * Import the application components.
 */
import App from '../components/App';

/*
 * Connect to the socket server.
 */
socketClient.connect(process.env.SERVER_URI);

/*
 * Create a new Vue application instance.
 */
new Vue({
	el: `#app`, // eslint-disable-line id-length
	router,
	store,
	render: createElement => createElement(App), // We must use render because we don't bundle in the Vue compiler.
});
