/*
 * FRONTEND ENTRY POINT
 */

/* eslint-plugin-disable node */

/*
 * Import the styles.
 */
import 'normalize.css';
import '../styles/main.scss';

/*
 * Import dependencies.
 */
import Vue from 'vue';
import router from './router';

/*
 * Import the components.
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
