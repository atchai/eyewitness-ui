<!--
	SCREEN: STORIES
-->

<template>

	<div id="stories-tab-body" :class="{ screen: true, padding: true, loading: (loadingState > 0) }">
		<BreakingNewsDialog :itemId="breakingNewsItemId" :storyTitle="breakingNewsStoryTitle" />
		<ScreenLoader />
		<ScreenHeader
			title="Stories"
			description="Stories from your feed that are currently being displayed to your users."
		/>
		<VirtualList :size="56" :remain="15" class="virtual-list">
			<Story
				v-for="story in storySet"
				:key="story.itemId"
				:itemId="story.itemId"
				:isFullFat="story.isFullFat"
				:title="story.title"
				:time="story.articleDate | formatDate('HH:MM')"
				:date="story.articleDate | formatDate('DD/MM/YY')"
				:published="story.published"
				:priority="story.priority"
				:showBreakingNewsDialog="showBreakingNewsDialog"
			/>
		</VirtualList>
	</div>

</template>

<script>

	import { mapGetters } from 'vuex';
	import VirtualList from 'vue-virtual-scroll-list';
	import ScreenHeader from '../../common/ScreenHeader';
	import ScreenLoader from '../../common/ScreenLoader';
	import BreakingNewsDialog from './BreakingNewsDialog';
	import Story from './Story';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';

	export default {
		data: function () {
			return {
				loadingState: 0,
				breakingNewsItemId: null,
				breakingNewsStoryTitle: null,
			};
		},
		components: { ScreenHeader, ScreenLoader, BreakingNewsDialog, Story, VirtualList },
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
					{},
					resData => {

						setLoadingFinished(this);

						if (!resData || !resData.success) {
							alert(`There was a problem loading the stories tab.`);
							return;
						}

						// Add all of the stories.
						this.$store.commit(`add-stories`, {
							data: resData.stories,
							sortField: `articleDate`,
							sortDirection: `desc`,
						});

					}
				);

			},

			showBreakingNewsDialog (itemId, storyTitle, oldPriority, published) {

				// Do nothing if the story is already marked priority.
				if (oldPriority) {
					alert(`Whoops! This story has already been sent out.`);
					return;
				}

				// Don't do anything if the article isn't published.
				if (!published) {
					alert(`Whoops! You can't send out breaking news if the story isn't published.`);
					return;
				}

				// Show the dialog.
				this.breakingNewsItemId = itemId;
				this.breakingNewsStoryTitle = storyTitle;

				const $el = document.getElementById(`send-breaking-news`);
				$el.showModal();

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

	#stories-tab-body {
		display: flex;
		flex-direction: column;

		.virtual-list {
			flex: 1;
			height: auto !important;
			contain: content;
			will-change: scroll-position;
		}
	}

</style>
