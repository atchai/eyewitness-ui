/*
 * VUE STORE
 */

import Vue from 'vue';
import Vuex from 'vuex';

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
		'update-thread': (state, payload) => state.threads[payload.threadId] = payload.threadData,
		'update-threads': (state, payload) => state.threads = payload,
		'update-article': (state, payload) => state.articles[payload.articleId] = payload.articleData,
		'update-articles': (state, payload) => state.articles = payload,
		'set-show-stories': (state, payload) => state.settings.showStories = payload,
		'update-welcome-message': (state, payload) => state.settings.welcomeMessages[payload.index] = payload.messageData,
		'update-welcome-messages': (state, payload) => state.settings.welcomeMessages = payload,
	},
});
