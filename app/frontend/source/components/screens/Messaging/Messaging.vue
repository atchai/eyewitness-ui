<!--
	SCREEN: MESSAGING
-->

<template>

	<div class="screen">
		<ThreadsPanel />
		<ConversationPanel />
	</div>

</template>

<script>

	import ThreadsPanel from './ThreadsPanel';
	import ConversationPanel from './ConversationPanel';

	export default {
		data: function () {
			return {

			};
		},
		components: { ThreadsPanel, ConversationPanel },
	};

</script>

<style lang="scss" scoped>

	.screen {
		flex-direction: row;
		align-items: stretch;
	}

</style>
