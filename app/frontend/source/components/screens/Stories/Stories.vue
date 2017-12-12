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

			fetchTabData () {

				if (!setLoadingStarted(this)) { return; }

				getSocket().emit(
					`stories/pull-tab-data`,
					{ pageSize: APP_CONFIG.pageSize },
					resData => {

						setLoadingFinished(this);

						if (!resData || !resData.success) { return alert(`There was a problem loading the stories tab.`); }

						// Replace all of the stories.
						this.$store.commit(`update-articles`, resData.stories);

					}
				);

			},

		},
		watch: {

			$route: {
				handler: `fetchTabData`,
				immediate: true,
			},

		},
	};

</script>

<style lang="scss" scoped>

</style>
