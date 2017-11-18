<!--
	THREADS PANEL
-->

<template>

	<div class="panel">
		<div class="inbox">Inbox</div>
		<div class="threads">
			<Thread
				v-for="thread in threads"
				:userFullName="thread.userFullName"
				:date="thread.latestDate | formatDate('ddd')"
				:message="thread.latestMessage"
			/>
		</div>
	</div>

</template>

<script>

	import Thread from './Thread';

	export default {
		computed: {
			threads () { return Object.values(this.$store.state.threads) },
		},
		components: { Thread },
	};

</script>

<style lang="scss" scoped>

	.panel {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		width: 20.00rem;
		background: $panel-background-color;
		border-right: 1px solid $panel-border-color;

		>.inbox {
			height: 5.00rem;
			line-height: 5.00rem;
			text-align: center;
			text-transform: uppercase;
			color: $panel-grey-text;
			letter-spacing: 1px;
			border-bottom: 1px solid $panel-border-color;
		}

		>.threads {
			flex: 1;
			@include scroll-vertical();
		}
	}

</style>
