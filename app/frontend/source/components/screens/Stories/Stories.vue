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
		getScrollElementsInRange,
		convertElementsToItems,
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

				// Get the elements.
				const scrollDirection = (scrollTop > this.lastScrollTop ? `down` : `up`);
				const { $inRangeElements, $lostRangeElements } =
					getScrollElementsInRange(`stories-tab-body`, `story`, APP_CONFIG.pageBufferSize, scrollTop, scrollDirection);

				// Convert to items.
				const inRangeItems = convertElementsToItems($inRangeElements, this.$store.state.articles);
				const lostRangeItems = convertElementsToItems($lostRangeElements, this.$store.state.articles);

				// Filter out the thin items that are in range and need fattening up.
				const thinInRangeItems = inRangeItems.filter(item => !item.isFullFat);

				// Replace the fat items that have just gone out of range with thinner copies.
				lostRangeItems.forEach(item => {
					this.$store.commit(`update-article`, {
						key: item.articleId,
						data: { articleId: item.articleId },
					});
				});

				// Get just the IDs for the next stage.
				const itemIdsToFetch = thinInRangeItems.map(item => item.articleId);

				// Load in new items, if any.
				if (itemIdsToFetch.length) { this.fetchTabData(itemIdsToFetch); }

				// Cache this for the next call.
				this.lastScrollTop = scrollTop;

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
