<!--
	FRONTEND ENTRY POINT
-->

<template>

	<div id="app">
		<HeaderBar />
		<main>
			<router-view />
		</main>
	</div>

</template>

<script>
	/* eslint-disable node/no-unsupported-features */

	import HeaderBar from './chrome/HeaderBar';

	export default {
		data: function () {
			return {
				msg: `Hello, World!`,
			};
		},
		components: { HeaderBar },
	};

</script>

<style lang="scss">

	#app {
		display: flex;
		flex-direction: column;
		max-width: 1200px;
		height: 100%;
		margin: 0 auto;

		main {
			flex: 1;
		}
	}

</style>
