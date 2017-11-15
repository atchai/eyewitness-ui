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

/*
 * Import the application components.
 */
import App from '../components/App';

/*
 * Create a new Vue application instance.
 */
new Vue({
	el: `#app`, // eslint-disable-line id-length
	router,
	render: createElement => createElement(App), // We must use render because we don't bundle in the Vue compiler.
});
