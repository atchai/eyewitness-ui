<!--
	SCREEN: ARTICLES
-->

<template>

	<div :class="{ screen: true, padding: true, 'scroll-vertical': true, loading: (loadingState > 0) }">
		<ScreenLoader />
		<ScreenHeader
			title="Stories"
			description="Stories from your feed that are currently being displayed to your users."
		/>
		<Story
			v-for="article in articleSet"
			:key="article.articleId"
			:articleId="article.articleId"
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
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';

	export default {
		data: function () {
			return {
				loadingState: 0,
				loadingRoute: ``,
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
					`stories/pull-tab-data`,
					{ itemIdsToFetch, pageInitialSize: APP_CONFIG.pageInitialSize },
					resData => {

						setLoadingFinished(this);

						if (!resData || !resData.success) { return alert(`There was a problem loading the stories tab.`); }

						// Replace all or update some of the stories.
						const replaceByKeyField = (itemIdsToFetch && itemIdsToFetch.length ? `articleId` : null);
						this.$store.commit(`update-articles`, { replaceByKeyField, data: resData.stories });

					}
				);

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
