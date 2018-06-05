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
	strict: (process.env.NODE_ENV !== `production`),
	state: {
		threads: {},
		messages: {},
		stories: {},
		flows: {},
		globalSettings: {},
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

		'update-flows': (state, payload) => updateStoreProperty(state, `flows`, payload),
		'update-flow': (state, payload) => updateStorePropertyItem(state, `flows`, payload),
		'add-flow': (state, payload) => addStorePropertyItem(state, `flows`, payload),
		'remove-flow': (state, payload) => removeStorePropertyItem(state, `flows`, payload),

		'update-global-settings': (state, payload) => updateStoreProperty(state, `globalSettings`, payload),

	},
	getters: {
		hasThread: state => threadId => Boolean(state.threads[threadId]),
		threadSet: state => Object.values(state.threads),
		messageSet: state => Object.values(state.messages),
		storySet: state => Object.values(state.stories),
		flowsSet: state => Object.values(state.flows),
		flows: state => state.flows,
		globalSettings: state => state.globalSettings,
	},
});
