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
			v-for="article in articles"
			:key="article.articleId"
			:title="article.title"
			:time="article.articleDate | formatDate('HH:MM')"
			:date="article.articleDate | formatDate('DD/MM/YY')"
			:published="article.published"
		/>
	</div>

</template>

<script>

	import ScreenHeader from '../../common/ScreenHeader';
	import Story from './Story';

	export default {
		computed: {
			articles () { return Object.values(this.$store.state.articles) },
		},
		components: { ScreenHeader, Story },
	};

</script>

<style lang="scss" scoped>

</style>
