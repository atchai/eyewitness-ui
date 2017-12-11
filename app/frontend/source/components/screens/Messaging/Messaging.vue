<!--
	SCREEN: MESSAGING
-->

<template>

	<div :class="{ screen: true, loading: (loadingState > 0) }">
		<ThreadsPanel />
		<router-view></router-view>
	</div>

</template>

<script>

	import ThreadsPanel from './ThreadsPanel';
	import ConversationPanel from './ConversationPanel';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';

	export default {
		data: function () {
			return {
				loadingState: 0,
			};
		},
		components: { ThreadsPanel, ConversationPanel },
		methods: {

			fetchTabData () {

				setLoadingStarted(this);

				getSocket().emit(
					`messaging/pull-tab-data`,
					{},
					resData => {

						setLoadingFinished(this);

						if (!resData || !resData.success) { return alert(`There was a problem loading the messaging tab.`); }

						// Replace all of the threads.
						this.$store.commit(`update-threads`, resData.threads);

					}
				);

			},

		},
		watch: {

			$route: {
				handler: `fetchTabData`,
				immediate: true,
			},

		},
	};

</script>

<style lang="scss" scoped>

	.screen {
		display: flex;
		flex-direction: row;
		align-items: stretch;
	}

</style>
