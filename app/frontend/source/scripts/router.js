/*
 * VUE ROUTER
 */

/* eslint-plugin-disable node */

import Vue from 'vue';
import VueRouter from 'vue-router';
import Messaging from '../components/screens/Messaging';
import Articles from '../components/screens/Articles';
import BreakingNews from '../components/screens/BreakingNews';
import Settings from '../components/screens/Settings';

Vue.use(VueRouter);

export default new VueRouter({
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
	],
});
