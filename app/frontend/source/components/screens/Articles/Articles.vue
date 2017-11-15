<!--
	SCREEN: ARTICLES
-->

<template>

	<div class="screen padding">
		<ScreenHeader
			title="Stories"
			description="Stories from your feed that are currently being displayed to your users."
		/>
		<p>The articles screen!</p>
	</div>

</template>

<script>

	import ScreenHeader from '../../common/ScreenHeader';
	import Story from './Story';

	export default {
		data: function () {
			return {

			};
		},
		components: { ScreenHeader, Story },
	};

</script>

<style lang="scss" scoped>

</style>
