<!--
	SCREEN: ARTICLES
-->

<template>

	<div class="screen padding scroll-vertical">
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

	export default {
		computed: {
			...mapGetters([
				`articleSet`,
			]),
		},
		components: { ScreenHeader, Story },
	};

</script>

<style lang="scss" scoped>

</style>
