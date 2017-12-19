<!--
	CONVERSATION PANEL
-->

<template>

	<div class="panel">

		<div class="toolbar">
			<div class="image">
				<div class="image-circle"></div>
			</div>
			<div class="name">{{ thread.userFullName }}</div>
			<div class="actions">
				<span class="label">Bot:</span>
				<div :class="{ 'tag': true, 'on': thread.botEnabled }">
					<span v-if="thread.botEnabled">Enabled</span>
					<span v-if="!thread.botEnabled">Disabled</span>
				</div>
				<a href="JavaScript:void(0);" v-if="thread.botEnabled" @click="setBotDisabled(thread.itemId)"><span >disable</span></a>
				<a href="JavaScript:void(0);" v-if="!thread.botEnabled" @click="setBotEnabled(thread.itemId)"><span>enable</span></a>
			</div>
		</div>

		<div id="message-list" class="messages" v-scroll="onScroll">
			<div class="top-ruler">
				<div class="rule"></div>
				<div class="label">
					<span>{{ numOldMessagesLoadedText }}</span>
					<span v-if="!this.loadedAllMessages">
						- <a href="JavaScript:void(0);" @click="loadMoreMessages()">Load More</a>
					</span>
				</div>
				<div class="rule"></div>
			</div>
			<Message
				v-for="message in messageSet"
				:key="message.itemId"
				:itemId="message.itemId"
				:direction="message.direction"
				:humanToHuman="message.humanToHuman"
				:sentAt="message.sentAt"
				:data="message.data"
			/>
		</div>

		<div class="composer">
			<div class="image-container" @click="selectTextInput">
				<div class="image" :style="`background-image: url('${providerPhotoUrl}');`"></div>
			</div>
			<div class="text-input" @click="selectTextInput">
				<textarea
					id="composer-text-input"
					placeholder="Write a reply..."
					@keydown.enter.exact.prevent="sendMessage(thread.itemId, $event)"
					>
				</textarea>
			</div>
			<div class="tools">
				<div class="icon">A</div>
				<div class="icon">B</div>
				<div class="icon">C</div>
				<div class="icon">D</div>
			</div>
		</div>

	</div>

</template>

<script>

	import ObjectId from 'bson-objectid';
	import moment from 'moment';
	import Vue from 'vue';
	import { mapGetters } from 'vuex';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';
	import Message from './Message';

	export default {
		props: [`botEnabled`],
		data: function () {
			return {
				loadingState: 0,
				loadingRoute: ``,
				lastScrollTop: 0,
				loadedAllMessages: false,
				providerPhotoUrl: APP_CONFIG.providerPhotoUrl,
			};
		},
		components: { Message },
		computed: {

			...mapGetters([
				`messageSet`,
			]),

			thread () { return this.$store.state.threads[this.$route.params.itemId] || {}; },

			isThread () { return Boolean(this.$store.state.threads[this.$route.params.itemId]); },

			numOldMessagesLoadedText () {
				const numMessages = Object.keys(this.$store.state.messages).length;
				return `Loaded ${(this.loadedAllMessages ? `all ` : ``)}${numMessages} message${numMessages !== 1 ? `s` : ``}`;
			},

		},
		methods: {

			fetchComponentData (loadOlderMessages = false) {

				return new Promise((resolve) => {

					if (!setLoadingStarted(this, loadOlderMessages, true)) { return resolve(); }

					let breakPointMessageId;

					if (loadOlderMessages) {
						const $messageList = document.getElementById(`message-list`);
						const $messages = $messageList.getElementsByClassName(`message`);

						breakPointMessageId = $messages[0].getAttribute(`data-item-id`);
					}

					getSocket().emit(
						`messaging/thread/get-messages`,
						{ threadId: this.$route.params.itemId, breakPointMessageId, pageInitialSize: APP_CONFIG.pageInitialSize },
						resData => {

							setLoadingFinished(this);

							if (!resData || !resData.success) {
								alert(`There was a problem loading the thread's messages.`);
								return resolve();
							}

							// Replace all or update some of the messages.
							if (resData.messages && Object.keys(resData.messages).length) {
								const commitAction = (loadOlderMessages ? `add-messages` : `update-messages`);
								this.$store.commit(commitAction, { data: resData.messages, sortField: `sentAt`, sortDirection: `asc` });
								this.loadedAllMessages = (Object.keys(resData.messages).length < APP_CONFIG.pageInitialSize);
							}
							else {
								this.loadedAllMessages = true;
							}

							// If we're loading in the initial messages we need to scroll to the bottom and mark as read.
							if (!loadOlderMessages) {
								this.scrollMessagesToBottom(true);
								this.markAsReadByAdmin();
							}

							return resolve();

						}
					);

				});

			},

			setBotEnabled (itemId) {

				this.$store.commit(`update-thread`, {
					key: itemId,
					dataField: `botEnabled`,
					dataValue: true,
				});

				getSocket().emit(
					`messaging/thread/set-bot-enabled`,
					{ itemId, enabled: true },
					data => (!data || !data.success ? alert(`There was a problem enabling the user's bot.`) : void (0))
				);

			},

			setBotDisabled (itemId) {

				this.$store.commit(`update-thread`, {
					key: itemId,
					dataField: `botEnabled`,
					dataValue: false,
				});

				getSocket().emit(
					`messaging/thread/set-bot-enabled`,
					{ itemId, enabled: false },
					data => (!data || !data.success ? alert(`There was a problem disabling the user's bot.`) : void (0))
				);

			},

			selectTextInput () {
				document.getElementById(`composer-text-input`).focus();
			},

			scrollMessagesToBottom (force = false) {

				// Nothing to do if the element hasn't been rendered yet.
				if (!this.$el) { return; }

				const element = this.$el.querySelector(`.messages`);
				const isStuckToBottom = (element.scrollTop === element.scrollHeight - element.clientHeight);

				// Only autoscroll if the user has already scrolled to the bottom.
				if (isStuckToBottom || force) {
					this.$nextTick(() => element.scrollTop = element.scrollHeight);
				}

			},

			sendMessage (itemId, event) {

				// No message so nothing to do.
				const messageText = event.target.value.trim();
				if (!messageText) { return; }

				event.target.value = ``;

				// Disable the bot in the UI.
				this.$store.commit(`update-thread`, {
					key: itemId,
					dataField: `botEnabled`,
					dataValue: false,
				});

				// Send the message (also disables the bot).
				getSocket().emit(
					`messaging/thread/send-message`,
					{ itemId, messageText },
					data => (!data || !data.success ? alert(`There was a problem sending your message.`) : void (0))
				);

			},

			markAsReadByAdmin () {

				// If there's no thread ID present then we don't have anything to mark as read (yet).
				const itemId = (this.thread && this.thread.itemId);
				if (!itemId) { return; }

				const lastRead = moment().toISOString();

				this.$store.commit(`update-thread`, {
					key: itemId,
					dataField: `adminLastReadMessages`,
					dataValue: lastRead,
				});

				getSocket().emit(
					`messaging/thread/set-admin-read-date`,
					{ itemId, lastRead },
					data => (!data || !data.success ? alert(`There was a problem marking the thread as read.`) : void (0))
				);

			},

			async onScroll (event, { scrollTop }) {

				const scrollDirection = (scrollTop >= this.lastScrollTop ? `down` : `up`);
				const isScrolledToBottom = (scrollTop === event.target.scrollHeight - event.target.clientHeight);

				if (scrollDirection === `up` && scrollTop <= 0) {
					this.loadMoreMessages(event.target);
				}

				else if (scrollDirection === `down` && isScrolledToBottom) {
					this.markAsReadByAdmin();
				}

				// Cache this for the next call.
				this.lastScrollTop = scrollTop;

			},

			async loadMoreMessages (_scrollContainer) {

				const scrollContainer = _scrollContainer || document.getElementById(`message-list`);
				const scrollHeightBefore = scrollContainer.scrollHeight;

				// Load in new messages.
				await this.fetchComponentData(true);

				// Scroll down to where we were before.
				const scrollHeightAfter = scrollContainer.scrollHeight;
				const scrollHeightDiff = scrollHeightAfter - scrollHeightBefore;

				scrollContainer.scrollTop = scrollHeightDiff;

			},

		},
		watch: {

			$route: {
				handler: function () { this.fetchComponentData(false); },
				immediate: true,
			},

			'$store.state.messages': {
				handler: function () { this.scrollMessagesToBottom(); },
				immediate: true,
			}

		},
		beforeDestroy () {
			this.$store.commit(`remove-all-messages`);
		},
	};

</script>

<style lang="scss" scoped>

	.panel {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;

		>.toolbar {
			display: flex;
			height: 5.00rem;
			line-height: 5.00rem;
			border-bottom: 1px solid $panel-border-color;

			>.image {
				display: flex;
				flex-shrink: 0;
				width: 3.50rem;
				margin-left: 0.50rem;
				margin-right: 0.50rem;

				>.image-circle {
					display: block;
					margin: auto;
					width: 3.00rem;
					height: 3.00rem;
					border-radius: 50%;
					background-color: #9B9B9B;
					background-size: cover;
					overflow: hidden;
				}
			}

			>.name {
				flex: 1;
				font-size: 1.30rem;
				font-weight: bold;
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}

			>.actions {
				max-width: 18.00rem;
				flex-shrink: 0;
				text-align: right;
				white-space: nowrap;
				margin-left: 0.50rem;
				margin-right: 0.50rem;
				@include user-select-off();

				.label {
					font-size: 1.30rem;
				}

				.tag {
					margin-left: 0.50rem;
				}

				a {
					margin-left: 0.50rem;
					color: $faded-color;
					text-decoration: none;
				}
			}
		}

		>.messages {
			position: relative;
			flex: 1;
			padding: 1.00rem;
			@include scroll-vertical();

			>.top-ruler {
				display: flex;
				align-items: center;
				font-size: 0.70em;
				color: #bbb;
				text-transform: lowercase;
				margin-top: 1.00rem;
				margin-bottom: 3.00rem;
				@include user-select-off();

				>.rule {
					flex: 1;
					height: 1px;
					background: #ccc;
					margin: 0 1.00rem;
				}

				>.label {

				}
			}
		}

		>.composer {
			display: flex;
			height: 8.00rem;
			border-top: 1px solid $panel-border-color;

			>.image-container {
				display: flex;
				flex-shrink: 0;
				width: 5.00rem;
				cursor: text;

				>.image {
					width: 3.00rem;
					height: 3.00rem;
					margin: auto;
					border-radius: 0.25rem;
					background-size: cover;
					background-position: center;
					background-repeat: no-repeat;
				}
			}

			>.text-input {
				flex: 1;
				height: 100%;
				padding: 1.00rem 0;
				cursor: text;

				>textarea {
					width: 100%;
					height: 100%;
					resize: none;
					border: 0;
					outline: 0;
				}
			}

			>.tools {
				display: flex;
				align-items: center;
				justify-content: center;
				width: 10.00rem;
				height: 100%;
				flex-shrink: 0;
				@include user-select-off();

				>.icon {
					width: 2.00rem;
					text-align: center;
					visibility: hidden;
				}
			}
		}
	}

</style>
