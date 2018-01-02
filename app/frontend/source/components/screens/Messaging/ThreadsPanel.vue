<!--
	THREADS PANEL
-->

<template>

	<div class="panel">
		<div class="inbox">Inbox</div>
		<div id="thread-list" :class="{ threads: true, loading: (loadingState > 0) }" v-scroll="onScroll">
			<ScreenLoader />
			<transition-group name="thread" tag="div">
				<Thread
					v-for="thread in threadSet"
					:key="thread.itemId"
					:itemId="thread.itemId"
					:isFullFat="thread.isFullFat"
					:userFullName="thread.userFullName"
					:date="thread.latestDate"
					:message="thread.latestMessage"
					:adminLastReadMessages="thread.adminLastReadMessages"
				/>
			</transition-group>
		</div>
	</div>

</template>

<script>

	import { mapGetters } from 'vuex';
	import ScreenLoader from '../../common/ScreenLoader';
	import Thread from './Thread';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished, handleOnScroll } from '../../../scripts/utilities';

	export default {
		data: function () {
			return {
				loadingState: 0,
				loadingRoute: ``,
				lastScrollTop: 0,
				lastLoadTimeout: null,
			};
		},
		computed: {
			...mapGetters([
				`threadSet`,
			]),
		},
		components: { ScreenLoader, Thread },
		methods: {

			fetchComponentData (itemIdsToFetch) {

				if (!setLoadingStarted(this, Boolean(itemIdsToFetch))) { return; }

				getSocket().emit(
					`messaging/get-threads`,
					{ itemIdsToFetch, pageInitialSize: APP_CONFIG.pageInitialSize },
					resData => {

						setLoadingFinished(this);

						if (!resData || !resData.success) { return alert(`There was a problem loading the threads.`); }

						// Replace all or update some of the threads.
						const replaceByKeyField = (itemIdsToFetch && itemIdsToFetch.length ? `itemId` : null);
						this.$store.commit(`update-threads`, { replaceByKeyField, data: resData.threads });

					}
				);

			},

			async onScroll (event, { scrollTop }) {
				handleOnScroll(this, `thread-list`, `thread`, `update-thread`, this.$store.state.threads, scrollTop);
			},

		},
		watch: {

			$route: {
				handler: function () { this.fetchComponentData(null); },
				immediate: true,
			},

		},
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
		@include user-select-off();

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
			position: relative;
			flex: 1;
			@include scroll-vertical();

			&.loading > * {
				filter: none !important;
			}
		}
	}

</style>
