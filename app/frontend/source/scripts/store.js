/*
 * VUE STORE
 */

import Vue from 'vue';
import Vuex from 'vuex';
import { addStoreObjectItem, updateStoreObjectItem, removeStoreObjectItem } from './utilities';

/*
 * Enable stores.
 */
Vue.use(Vuex);

/*
 * Export a configured store.
 */
export default new Vuex.Store({
	state: {
		threads: {},
		articles: {},
		welcomeMessages: {},
		showStories: null,
	},
	mutations: {
		'update-thread': (state, payload) => updateStoreObjectItem(state.threads, payload),
		'update-threads': (state, payload) => state.threads = payload,
		'remove-thread': (state, payload) => removeStoreObjectItem(state.threads, payload),
		'update-article': (state, payload) => updateStoreObjectItem(state.articles, payload),
		'update-articles': (state, payload) => state.articles = payload,
		'remove-article': (state, payload) => removeStoreObjectItem(state.articles, payload),
		'set-show-stories': (state, payload) => state.showStories = payload,
		'add-welcome-message': (state, payload) => addStoreObjectItem(state, `welcomeMessages`, payload),
		'update-welcome-message': (state, payload) => updateStoreObjectItem(state.welcomeMessages, payload),
		'update-welcome-messages': (state, payload) => state.welcomeMessages = payload,
		'remove-welcome-message': (state, payload) => removeStoreObjectItem(state.welcomeMessages, payload),
	},
	getters: {
		threadSet: state => Object.values(state.threads),
		articleSet: state => Object.values(state.articles),
		welcomeMessageSet: state => Object.values(state.welcomeMessages),
	},
});
