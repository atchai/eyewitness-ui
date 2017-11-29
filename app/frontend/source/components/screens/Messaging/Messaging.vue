<!--
	SCREEN: MESSAGING
-->

<template>

	<div class="screen">
		<ThreadsPanel />
		<router-view></router-view>
	</div>

</template>

<script>

	import ThreadsPanel from './ThreadsPanel';
	import ConversationPanel from './ConversationPanel';

	export default {

		components: { ThreadsPanel, ConversationPanel },
	};

</script>

<style lang="scss" scoped>

	.screen {
		display: flex;
		flex-direction: row;
		align-items: stretch;
	}

</style>
