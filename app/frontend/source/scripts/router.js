/*
 * VUE ROUTER
 */

import Vue from 'vue';
import VueRouter from 'vue-router';
import Messaging from '../components/screens/Messaging/Messaging';
import ConversationPanel from '../components/screens/Messaging/ConversationPanel';
import SelectConversation from '../components/screens/Messaging/SelectConversation';
import Stories from '../components/screens/Stories/Stories';
import BreakingNews from '../components/screens/BreakingNews/BreakingNews';
import Settings from '../components/screens/Settings/Settings';
import NotFound from '../components/screens/NotFound/NotFound';

Vue.use(VueRouter);

export default new VueRouter({
	mode: `history`,
	routes: [
		{
			path: `/`,
			redirect: { name: `Messaging` },
		},
		{
			path: `/messaging`,
			name: `Messaging`,
			component: Messaging,
			children: [{
				path: ``,
				component: SelectConversation,
			}, {
				path: `thread/:threadId`,
				component: ConversationPanel,
			}],
		},
		{
			path: `/stories`,
			name: `Stories`,
			component: Stories,
		},
		{
			path: `/breaking-news`,
			name: `BreakingNews`,
			component: BreakingNews,
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
