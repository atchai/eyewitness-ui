<!--
	SCREEN HEADER
-->

<template>

	<div class="screen-header">
		<h1>{{ title }}</h1>
		<p v-if="description">{{ description }}</p>
	</div>

</template>

<script>

	export default {
		props: [`title`, `description`],
	};

</script>

<style lang="scss" scoped>

	.screen-header {
		margin-bottom: 3.00rem;
		@include user-select-off();

		h1 {
			margin: 0;
			font-size: 3.00rem;
			font-weight: bold;
		}

		p {
			font-size: 1.30rem;
			margin: 0;
		}
	}

</style>
