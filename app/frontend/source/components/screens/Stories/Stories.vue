<!--
	SCREEN: ARTICLES
-->

<template>

	<div :class="{ screen: true, padding: true, 'scroll-vertical': true, loading: (loadingState > 0) }">
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
	import Story from './Story';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';

	export default {
		data: function () {
			return {
				loadingState: 0,
			};
		},
		components: { ScreenHeader, Story },
		computed: {
			...mapGetters([
				`articleSet`,
			]),
		},
		methods: {

			fetchTabData () {

				setLoadingStarted(this);

				getSocket().emit(
					`articles/pull-tab-data`,
					{},
					resData => {

						setLoadingFinished(this);

						if (!resData || !resData.success) { return alert(`There was a problem loading the stories tab.`); }

						// Replace all of the articles.
						this.$store.commit(`update-articles`, resData.articles);

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
