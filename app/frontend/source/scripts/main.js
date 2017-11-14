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
 * Import the application.
 */
import Vue from 'vue';
import App from '../vue/App';

/*
 * Create a new Vue application instance.
 */
new Vue({
	el: `#app`, // eslint-disable-line id-length
	render: createElement => createElement(App), // We must use render because we don't bundle in the Vue compiler.
});
