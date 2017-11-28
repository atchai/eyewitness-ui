/*
 * VUE STORE
 */

import Vue from 'vue';
import Vuex from 'vuex';
import { updateStoreObjectItem, removeStoreObjectItem } from './utilities';

Vue.use(Vuex);

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
		'add-welcome-message': (state, payload) => state.welcomeMessages[payload.welcomeMessageId] = payload,
		'update-welcome-message': (state, payload) => updateStoreObjectItem(state.welcomeMessages, payload),
		'update-welcome-messages': (state, payload) => state.welcomeMessages = payload,
		'remove-welcome-message': (state, payload) => removeStoreObjectItem(state.welcomeMessages, payload),
	},
});
