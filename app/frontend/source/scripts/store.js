/*
 * VUE STORE
 */

import Vue from 'vue';
import Vuex from 'vuex';
import {
	addStorePropertyItem,
	updateStoreProperty,
	updateStorePropertyItem,
	removeStorePropertyItem,
} from './utilities';

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
		messages: {},
		stories: {},
		welcomeMessages: {},
	},
	mutations: {

		'add-thread': (state, payload) => addStorePropertyItem(state, `threads`, payload),
		'update-thread': (state, payload) => updateStorePropertyItem(state, `threads`, payload),
		'update-threads': (state, payload) => updateStoreProperty(state, `threads`, payload),
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
		'update-story': (state, payload) => updateStorePropertyItem(state, `stories`, payload),
		'update-stories': (state, payload) => updateStoreProperty(state, `stories`, payload),
		'remove-story': (state, payload) => removeStorePropertyItem(state, `stories`, payload),

		'add-welcome-message': (state, payload) => addStorePropertyItem(state, `welcomeMessages`, payload),
		'update-welcome-message': (state, payload) => updateStorePropertyItem(state, `welcomeMessages`, payload),
		'update-welcome-messages': (state, payload) => updateStoreProperty(state, `welcomeMessages`, payload),
		'remove-welcome-message': (state, payload) => removeStorePropertyItem(state, `welcomeMessages`, payload),

	},
	getters: {
		hasThread: state => itemId => Boolean(state.threads[itemId]),
		threadSet: state => Object.values(state.threads),
		storySet: state => Object.values(state.stories),
		welcomeMessageSet: state => Object.values(state.welcomeMessages),
	},
});
