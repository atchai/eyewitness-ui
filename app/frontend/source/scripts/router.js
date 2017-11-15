/*
 * VUE ROUTER
 */

import Vue from 'vue';
import VueRouter from 'vue-router';
import Messaging from '../components/screens/Messaging/Messaging';
import Articles from '../components/screens/Articles/Articles';
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
			path: `/articles`,
			name: `Articles`,
			component: Articles,
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