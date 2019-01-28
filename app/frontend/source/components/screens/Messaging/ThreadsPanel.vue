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
		<div id="thread-list" :class="{ threads: true, loading: (loadingState > 0) }">
			<ScreenLoader />
			<VirtualList :size="76" :remain="15" class="virtual-list">
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
			</VirtualList>
		</div>
	</div>

</template>

<script>

	import { mapGetters } from 'vuex';
	import VirtualList from 'vue-virtual-scroll-list';
	import ScreenLoader from '../../common/ScreenLoader';
	import Thread from './Thread';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';

	export default {
		data: function () {
			return {
				loadingState: 0,
				inbox: `open`,
			};
		},
		computed: {
			...mapGetters([
				`threadSet`,
			]),
		},
		components: { ScreenLoader, Thread, VirtualList },
		methods: {

			fetchComponentData (itemIdsToFetch) {

				if (!setLoadingStarted(this, Boolean(itemIdsToFetch))) { return; }

				// Remember the inbox that is selected before starting the async request.
				const selectedInboxAtRequestStart = this.inbox;

				// Start the request.
				getSocket().emit(
					`messaging/get-threads`,
					{},
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
						this.$store.commit(`add-threads`, {
							data: resData.threads,
							sortField: `latestDate`,
							sortDirection: `desc`,
						});

					}
				);

			},

			openInbox (newInbox) {

				// Update the selected inbox.
				this.inbox = newInbox;

				// Scroll to top of list.
				document.getElementById(`thread-list`).scrollTop = 0;

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
		@include user-select-off();

		>.inbox-chooser {
			display: flex;
			height: 40px;

			>.box {
				display: flex;
				flex: 1;
				cursor: pointer;
				transition: all ease-in-out 200ms;

				&.closed, &.open {
					border: 1px solid #E7E7E7;
					background: white;

					>span {
						color: $panel-grey-text;
					}
				}

				&:hover {
					background: darken(white, 5%);
				}

				&.on {
					background: $brand-main-color;
					font-weight: bold;
					border: 1px solid #E7E7E7;
					border-bottom: none;

					>span {
						color: white;
					}
				}


				>span {
					margin: auto;
					font-size: 15px;
				}
				
			}
		}

		>.threads {
			display: flex;
			position: relative;
			flex: 1;
			background-color: white;
			border: 1px solid #E7E7E7;
			border-top: none;

			&.loading > * {
				filter: none !important;
			}

			.virtual-list {
				flex: 1;
				height: auto !important;
				contain: content;
				will-change: scroll-position;
			}
		}
	}

</style>
