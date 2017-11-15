<!--
	SCREEN: BREAKING NEWS
-->

<template>

	<div class="screen padding">
		<ScreenHeader
			title="Breaking News"
			description="Send a push notification message to all your users."
		/>
		<p>The breaking news screen!</p>
	</div>

</template>

<script>

	import ScreenHeader from '../common/ScreenHeader';

	export default {
		data: function () {
			return {

			};
		},
		components: { ScreenHeader },
	};

</script>

<style lang="scss" scoped>

</style>
