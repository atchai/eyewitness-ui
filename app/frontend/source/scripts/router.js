/*
 * VUE ROUTER
 */

import Vue from 'vue';
import VueRouter from 'vue-router';
import Messaging from '../components/screens/Messaging/Messaging';
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
