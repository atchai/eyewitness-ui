'use strict';

/*
 * FRONTEND ENTRY POINT
 */

/* eslint-disable node/no-unpublished-require */

require(`normalize.css`);
require(`../styles/main.scss`);

import Vue from 'vue';
import App from '../vue/App';

new Vue({
  el: '#app',
  render: createElement => createElement(App),
});
