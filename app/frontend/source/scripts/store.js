/*
 * VUE STORE
 */

import Vue from 'vue';
import Vuex from 'vuex';
import { addStorePropertyItem, updateStorePropertyItem, removeStorePropertyItem } from './utilities';

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
		maxOldThreadMessages: null,
	},
	mutations: {
		'add-thread': (state, payload) => addStorePropertyItem(state, `threads`, payload),
		'update-thread': (state, payload) => updateStorePropertyItem(state, `threads`, payload),
		'update-threads': (state, payload) => state.threads = payload,
		'remove-thread': (state, payload) => removeStorePropertyItem(state, `threads`, payload),
		'add-thread-message': (state, payload) => {
			updateStorePropertyItem(state, `threads`, {
				key: payload.key,
				dataFunction: thread => {

					const newMessage = payload.newMessage;
					const messages = Array.from(thread.messages);

					messages.push({
						messageId: newMessage.messageId,
						direction: newMessage.direction,
						humanToHuman: newMessage.humanToHuman,
						sentAt: newMessage.sentAt,
						data: newMessage.data,
					});

					thread.messages = messages;

					if (payload.latestDate && payload.latestMessage) {
						thread.latestDate = payload.latestDate;
						thread.latestMessage = payload.latestMessage;
					}

					return thread;

				},
			});
		},
		'update-article': (state, payload) => updateStorePropertyItem(state, `articles`, payload),
		'update-articles': (state, payload) => state.articles = payload,
		'remove-article': (state, payload) => removeStorePropertyItem(state, `articles`, payload),
		'set-show-stories': (state, payload) => state.showStories = payload,
		'add-welcome-message': (state, payload) => addStorePropertyItem(state, `welcomeMessages`, payload),
		'update-welcome-message': (state, payload) => updateStorePropertyItem(state, `welcomeMessages`, payload),
		'update-welcome-messages': (state, payload) => state.welcomeMessages = payload,
		'remove-welcome-message': (state, payload) => removeStorePropertyItem(state, `welcomeMessages`, payload),
		'set-max-old-thread-messages': (state, payload) => state.maxOldThreadMessages = payload,
	},
	getters: {
		hasThread: state => threadId => Boolean(state.threads[threadId]),
		threadSet: state => Object.values(state.threads),
		articleSet: state => Object.values(state.articles),
		welcomeMessageSet: state => Object.values(state.welcomeMessages),
	},
});
