/*
 * VUE ROUTER
 */

import Vue from 'vue';
import VueRouter from 'vue-router';

/*
 * Dynamic imports.
 */
const Messaging = () =>
	import(/* webpackChunkName: "messaging" */ `../components/screens/Messaging/Messaging`);
const ConversationPanel = () =>
	import(/* webpackChunkName: "messaging" */ `../components/screens/Messaging/ConversationPanel`);
const SelectConversation = () =>
	import(/* webpackChunkName: "messaging" */ `../components/screens/Messaging/SelectConversation`);

const Stories = () =>
	import(/* webpackChunkName: "stories" */ `../components/screens/Stories/Stories`);

const Settings = () =>
	import(/* webpackChunkName: "settings" */ `../components/screens/Settings/Settings`);

const NotFound = () =>
	import(/* webpackChunkName: "not-found" */ `../components/screens/NotFound/NotFound`);

/*
 * Initialise the router.
 */
Vue.use(VueRouter);

/*
 * Route configs.
 */
export default new VueRouter({
	mode: `history`,
	routes: [
		{
			path: `/`,
			redirect: { name: `Messaging` },
		},
		{
			path: `/messaging`,
			component: Messaging,
			children: [{
				path: ``,
				name: `Messaging`,
				component: SelectConversation,
			}, {
				path: `thread/:itemId`,
				component: ConversationPanel,
			}],
		},
		{
			path: `/stories`,
			name: `Stories`,
			component: Stories,
		},
		{
			path: `/settings`,
			name: `Settings`,
			component: Settings,
		},
		{
			path: `*`,
			name: `404`,
			component: NotFound,
		},
	],
});
