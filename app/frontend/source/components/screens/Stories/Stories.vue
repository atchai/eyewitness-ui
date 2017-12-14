<!--
	SCREEN: STORIES
-->

<template>

	<div id="stories-tab-body" :class="{ screen: true, padding: true, 'scroll-vertical': true, loading: (loadingState > 0) }" v-scroll="onScroll">
		<ScreenLoader />
		<ScreenHeader
			title="Stories"
			description="Stories from your feed that are currently being displayed to your users."
		/>
		<Story
			v-for="article in articleSet"
			:key="article.itemId"
			:itemId="article.itemId"
			:isFullFat="article.isFullFat"
			:title="article.title"
			:time="article.articleDate | formatDate('HH:MM')"
			:date="article.articleDate | formatDate('DD/MM/YY')"
			:published="article.published"
		/>
	</div>

</template>

<script>

	import { mapGetters } from 'vuex';
	import ScreenHeader from '../../common/ScreenHeader';
	import ScreenLoader from '../../common/ScreenLoader';
	import Story from './Story';
	import { getSocket } from '../../../scripts/webSocketClient';
	import {
		setLoadingStarted,
		setLoadingFinished,
		handleOnScroll,
	} from '../../../scripts/utilities';

	export default {
		data: function () {
			return {
				loadingState: 0,
				loadingRoute: ``,
				lastScrollTop: 0,
			};
		},
		components: { ScreenHeader, ScreenLoader, Story },
		computed: {
			...mapGetters([
				`articleSet`,
			]),
		},
		methods: {

			fetchTabData (itemIdsToFetch) {

				if (!setLoadingStarted(this, Boolean(itemIdsToFetch))) { return; }

				getSocket().emit(
					`stories/get-tab-data`,
					{ itemIdsToFetch, pageInitialSize: APP_CONFIG.pageInitialSize },
					resData => {

						setLoadingFinished(this);

						if (!resData || !resData.success) { return alert(`There was a problem loading the stories tab.`); }

						// Replace all or update some of the stories.
						const replaceByKeyField = (itemIdsToFetch && itemIdsToFetch.length ? `itemId` : null);
						this.$store.commit(`update-articles`, { replaceByKeyField, data: resData.stories });

					}
				);

			},

			async onScroll (event, { scrollTop }) {
				handleOnScroll(this, `stories-tab-body`, `story`, `update-article`, this.$store.state.articles, scrollTop);
			},

		},
		watch: {

			$route: {
				handler: function () { this.fetchTabData(null); },
				immediate: true,
			},

		},
	};

</script>

<style lang="scss" scoped>

</style>
