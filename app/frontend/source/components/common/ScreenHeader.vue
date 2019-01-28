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
		flex-shrink: 0;
		margin-bottom: 2.5rem;
		@include user-select-off();

		h1 {
			margin: 0;
			font-size: 28px;
			font-weight: 500;
		}

		p {
			font-size: 1.30rem;
			margin: 0;
			font-size: 15px;
			color: #9c9c9c;
			font-weight: 400;
		}
	}

</style>
