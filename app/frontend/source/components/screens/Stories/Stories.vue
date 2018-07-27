<!--
	SCREEN: STORIES
-->

<template>

	<div id="stories-tab-body" :class="{ screen: true, padding: true, loading: (loadingState > 0) }">
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
			/>
		</VirtualList>
	</div>

</template>

<script>

	import { mapGetters } from 'vuex';
	import VirtualList from 'vue-virtual-scroll-list';
	import ScreenHeader from '../../common/ScreenHeader';
	import ScreenLoader from '../../common/ScreenLoader';
	import Story from './Story';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';

	export default {
		data: function () {
			return {
				loadingState: 0,
			};
		},
		components: { ScreenHeader, ScreenLoader, Story, VirtualList },
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
