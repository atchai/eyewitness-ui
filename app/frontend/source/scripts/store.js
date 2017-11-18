/*
 * VUE STORE
 */

import Vue from 'vue';
import Vuex from 'vuex';
import { updateStoreObjectItem } from './utilities';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		threads: {},
		articles: {},
		settings: {
			showStories: null,
			welcomeMessages: [],
		},
	},
	mutations: {
		'update-thread': (state, payload) => updateStoreObjectItem(state.threads, payload),
		'update-threads': (state, payload) => state.threads = payload,
		'update-article': (state, payload) => updateStoreObjectItem(state.articles, payload),
		'update-articles': (state, payload) => state.articles = payload,
		'set-show-stories': (state, payload) => state.settings.showStories = payload,
		'update-welcome-message': (state, payload) => updateStoreObjectItem(state.settings.welcomeMessages, payload),
		'update-welcome-messages': (state, payload) => state.settings.welcomeMessages = payload,
	},
});
