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

	import HeaderBar from './chrome/HeaderBar';

	export default {
		components: { HeaderBar },
	};

</script>

<style lang="scss" scoped>

	#app {
		display: flex;
		flex-direction: column;
		max-width: 1200px;
		height: 100%;
		margin: 0 auto;
		background: white;

		main {
			flex: 1;
			min-height: 0;

			.screen {
				width: 100%;
				height: 100%;

				&.padding {
					padding: 2.00rem 3.00rem;
				}

				&.scroll-vertical {
					@include scroll-vertical();
				}
			}
		}
	}

</style>
