<!--
	SELECT CONVERSATION
-->

<template>

	<div class="panel">
		<p>← Select a thread from the left-hand column.</p>
	</div>

</template>

<script>

	export default {
		data: function () {
			return {

			};
		},
	};

</script>

<style lang="scss" scoped>

	.panel {
		flex: 1;
		@include user-select-off();

		>p {
			margin-top: 8.00rem;
			margin-bottom: auto;
			text-align: center;
			font-size: 120%;
		}
	}

</style>
