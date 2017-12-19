/*
 * VUE STORE
 */

import Vue from 'vue';
import Vuex from 'vuex';
import {
	addStorePropertyItem,
	addStorePropertyItems,
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
	strict: true,
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

		'add-message': (state, payload) => addStorePropertyItem(state, `messages`, payload),
		'add-messages': (state, payload) => addStorePropertyItems(state, `messages`, payload),
		'update-message': (state, payload) => updateStorePropertyItem(state, `messages`, payload),
		'update-messages': (state, payload) => updateStoreProperty(state, `messages`, payload),
		'remove-message': (state, payload) => removeStorePropertyItem(state, `messages`, payload),
		'remove-all-messages': (state) => state.messages = {},

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
		messageSet: state => Object.values(state.messages),
		storySet: state => Object.values(state.stories),
		welcomeMessageSet: state => Object.values(state.welcomeMessages),
	},
});
