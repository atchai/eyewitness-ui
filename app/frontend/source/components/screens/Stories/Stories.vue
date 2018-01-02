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
			v-for="story in storySet"
			:key="story.itemId"
			:itemId="story.itemId"
			:isFullFat="story.isFullFat"
			:title="story.title"
			:time="story.articleDate | formatDate('HH:MM')"
			:date="story.articleDate | formatDate('DD/MM/YY')"
			:published="story.published"
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
				lastLoadTimeout: null,
			};
		},
		components: { ScreenHeader, ScreenLoader, Story },
		computed: {
			...mapGetters([
				`storySet`,
			]),
		},
		methods: {

			fetchComponentData (itemIdsToFetch) {

				if (!setLoadingStarted(this, Boolean(itemIdsToFetch))) { return; }

				getSocket().emit(
					`stories/get-tab-data`,
					{ itemIdsToFetch, pageInitialSize: APP_CONFIG.pageInitialSize },
					resData => {

						setLoadingFinished(this);

						if (!resData || !resData.success) { return alert(`There was a problem loading the stories tab.`); }

						// Replace all or update some of the stories.
						const replaceByKeyField = (itemIdsToFetch && itemIdsToFetch.length ? `itemId` : null);
						this.$store.commit(`update-stories`, { replaceByKeyField, data: resData.stories });

					}
				);

			},

			async onScroll (event, { scrollTop }) {
				const stories = this.$store.state.stories;
				handleOnScroll(this, `stories-tab-body`, `story`, `update-story`, stories, scrollTop, null);
			},

		},
		watch: {

			$route: {
				handler: function () { this.fetchComponentData(null); },
				immediate: true,
			},

		},
	};

</script>

<style lang="scss" scoped>

</style>
