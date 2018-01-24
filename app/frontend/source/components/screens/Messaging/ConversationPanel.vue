<!--
	CONVERSATION PANEL
-->

<template>

	<div class="panel">

		<div class="toolbar">
			<div class="image">
				<div class="image-circle" :style="`background-image: url('${thread.profilePicUrl}')`"></div>
			</div>
			<div class="name">{{ thread.userFullName }}</div>
			<div class="enquiry-type">{{ thread.enquiryType | enquiryType() }}</div>
			<div class="filler"></div>
			<div class="actions">
				<div class="bot-toggle">
					<button href="JavaScript:void(0);" @click="setBotEnabledState(thread.itemId, thread.botEnabled)" :class="{ 'shrunk': true, 'danger': thread.botEnabled, 'primary': !thread.botEnabled }">
						<span v-if="thread.botEnabled">Disable bot</span>
						<span v-if="!thread.botEnabled">Enable bot</span>
					</button>
				</div>
				<div class="conversation-done">
					<button :class="{ 'shrunk': true, 'primary': thread.conversationState === `open`, 'closed': thread.conversationState === `closed` }" @click="closeThread(thread.itemId, thread.conversationState)">
						Done
					</button>
				</div>
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
					@keydown.enter.exact.prevent="sendMessage(thread.itemId)"
					>
				</textarea>
			</div>
			<div class="actions">
				<button class="primary shrunk" @click="sendMessage(thread.itemId)">Send</button>
			</div>
		</div>

	</div>

</template>

<script>

	import ObjectId from 'bson-objectid';
	import moment from 'moment';
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

				if (this.loadedAllMessages) {
					return `Loaded all ${numMessages} messages`;
				}
				else {
					return `Loaded ${numMessages} message${numMessages !== 1 ? `s` : ``}`;
				}

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

			setBotEnabledState (itemId, oldState) {

				const newState = !oldState;

				this.$store.commit(`update-thread`, {
					key: itemId,
					dataField: `botEnabled`,
					dataValue: newState,
				});

				getSocket().emit(
					`messaging/thread/set-bot-enabled`,
					{ itemId, enabled: newState },
					data => (!data || !data.success ? alert(`There was a problem changing the user's bot status.`) : void (0))
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

			sendMessage (itemId) {

				// No message so nothing to do.
				const $textarea = document.getElementById(`composer-text-input`);
				const messageText = $textarea.value.trim();
				if (!messageText) { return; }

				$textarea.value = ``;

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

			closeThread (itemId, oldState) {

				// Don't do anything if the thread is already closed.
				if (oldState === `closed`) { return; }

				// Close the thread in the UI.
				this.$store.commit(`update-thread`, {
					key: itemId,
					dataField: `conversationState`,
					dataValue: `closed`,
				});

				// Close the thread.
				getSocket().emit(
					`messaging/thread/close`,
					{ itemId },
					data => {

						if (!data || !data.success) { return alert(`There was a problem closing the conversation.`); }


					}
				);

			},

			markAsReadByAdmin () {

				// If there's no thread ID present then we don't have anything to mark as read (yet).
				const itemId = (this.thread && this.thread.itemId);
				if (!itemId) { return; }

				// Update last read timestamp.
				this.$store.commit(`update-thread`, {
					key: itemId,
					dataField: `adminLastReadMessages`,
					dataValue: moment().toISOString(),
				});

				// Update the last read field properly.
				getSocket().emit(
					`messaging/thread/set-admin-read-date`,
					{ itemId },
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
				handler: function () {
					this.fetchComponentData(false);
					this.$nextTick(this.selectTextInput);
				},
				immediate: true,
			},

			'$store.state.messages': {
				handler: function () {

					const $messageList = document.getElementById(`message-list`);
					if (!$messageList) { return; }

					// We're able to scroll.
					if ($messageList.scrollHeight > $messageList.clientHeight) {
						this.scrollMessagesToBottom();
					}

					// We can't scroll, but must still mark the new messages as read.
					else {
						this.markAsReadByAdmin();
					}

				},
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
				font-size: 1.30rem;
				font-weight: bold;
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}

			>.enquiry-type {
				flex-shrink: 0;
				font-style: italic;
				font-size: 1.30rem;
				font-weight: bold;
				white-space: nowrap;
				color: $faded-color;
				margin: 0 1.00rem;
			}

			>.filler {
				flex: 1;
			}

			>.actions {
				flex-shrink: 0;
				text-align: right;
				white-space: nowrap;
				margin-left: 0.50rem;
				margin-right: 0.50rem;
				@include user-select-off();

				>.bot-toggle {
					display: inline-flex;
					flex-shrink: 0;
					padding-left: 0.50rem;

					>button {
						margin: auto;
					}
				}

				>.conversation-done {
					display: inline-flex;
					flex-shrink: 0;
					padding-left: 0.50rem;

					>button {
						margin: auto;

						&.closed {
							cursor: not-allowed;
							filter: none !important;
						}
					}
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

			>.actions {
				display: flex;
				flex-shrink: 0;
				padding: 1.00rem;

				>button {
					margin: auto;
				}
			}
		}
	}

</style>
