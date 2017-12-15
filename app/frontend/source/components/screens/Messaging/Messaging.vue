<!--
	SCREEN: MESSAGING
-->

<template>

	<div :class="{ screen: true }">
		<ScreenLoader />
		<ThreadsPanel />
		<router-view></router-view>
	</div>

</template>

<script>

	import ConversationPanel from './ConversationPanel';
	import ThreadsPanel from './ThreadsPanel';
	import ScreenLoader from '../../common/ScreenLoader';
	import { getSocket } from '../../../scripts/webSocketClient';

	export default {
		data: function () {
			return {

			};
		},
		components: { ConversationPanel, ScreenLoader, ThreadsPanel },
	};

</script>

<style lang="scss" scoped>

	.screen {
		display: flex;
		flex-direction: row;
		align-items: stretch;
	}

</style>
