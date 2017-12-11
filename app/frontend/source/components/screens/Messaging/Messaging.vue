<!--
	SCREEN: MESSAGING
-->

<template>

	<div :class="{ screen: true, loading: (loadingState > 0) }">
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
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';

	export default {
		data: function () {
			return {
				loadingState: 0,
			};
		},
		components: { ConversationPanel, ScreenLoader, ThreadsPanel },
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
