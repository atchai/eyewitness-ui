<!--
	THREADS PANEL
-->

<template>

	<div class="panel">
		<div class="inbox-chooser">
			<div :class="{ 'box': true, 'open': true, on: (inbox === `open`) }" @click="openInbox(`open`)">
				<span>Inbox</span>
			</div>
			<div class="divider"></div>
			<div :class="{ 'box': true, 'closed': true, on: (inbox === `closed`) }" @click="openInbox(`closed`)">
				<span>Done</span>
			</div>
		</div>
		<div id="thread-list" :class="{ threads: true, loading: (loadingState > 0) }" v-scroll="onScroll">
			<ScreenLoader />
			<transition-group name="thread" tag="div">
				<Thread
					v-for="thread in threadSet"
					v-if="thread.conversationState === inbox"
					:key="thread.itemId"
					:itemId="thread.itemId"
					:isFullFat="thread.isFullFat"
					:userFullName="thread.userFullName"
					:imageUrl="thread.profilePicUrl"
					:date="thread.latestDate"
					:message="thread.latestMessage"
					:adminLastReadMessages="thread.adminLastReadMessages"
					:enquiryType="thread.enquiryType"
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
				inbox: `open`,
				essentialThreadFields: [`latestDate`, `conversationState`],
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

				// Remember the inbox that is selected before starting the async request.
				const selectedInboxAtRequestStart = this.inbox;

				// Start the request.
				getSocket().emit(
					`messaging/get-threads`,
					{ itemIdsToFetch, pageInitialSize: APP_CONFIG.pageInitialSize },
					resData => {

						setLoadingFinished(this);

						// Don't do anything if the selected inbox has been changed since the network request was started.
						if (this.inbox !== selectedInboxAtRequestStart) { return; }

						// Handle errors.
						if (!resData || !resData.success) {
							alert(`There was a problem loading the threads.`);
							return;
						}

						// Replace all or update some of the threads.
						const replaceByKeyField = (itemIdsToFetch && itemIdsToFetch.length ? `itemId` : null);
						this.$store.commit(`update-threads`, { replaceByKeyField, data: resData.threads });

					}
				);

			},

			openInbox (newInbox) {

				// Update the selected inbox.
				this.inbox = newInbox;

				// Scroll to top of list.
				this.lastScrollTop = 0;
				document.getElementById(`thread-list`).scrollTop = 0;
				this.onScroll(null, { scrollTop: 0 });

			},

			async onScroll (event, { scrollTop }) {

				const threads = this.$store.state.threads;
				const selecedItemId = this.$route.params.itemId || null;
				const keepItemsFat = (selecedItemId ? [ this.$route.params.itemId ] : null);

				handleOnScroll(
					this,
					`thread-list`,
					`thread`,
					`update-thread`,
					threads,
					scrollTop,
					this.essentialThreadFields,
					keepItemsFat
				);

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

		>.inbox-chooser {
			display: flex;
			height: 5.00rem;
			border-bottom: 1px solid $panel-border-color;

			>.box {
				display: flex;
				flex: 1;
				cursor: pointer;

				&.on {
					background: $panel-border-color;
					font-weight: bold;
				}

				&:hover {
					background: $panel-hover-color;
				}

				>span {
					margin: auto;
					text-transform: uppercase;
					color: $panel-grey-text;
				}
			}

			>.divider {
				background: $panel-border-color;
				width: 1px;
				flex-shrink: 0;
				flex-grow: 0;
			}
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
