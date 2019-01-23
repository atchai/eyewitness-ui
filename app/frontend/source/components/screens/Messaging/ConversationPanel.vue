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
					<button :class="{ 'shrunk': true, 'primary': true }" @click="setThreadState(thread.itemId, thread.conversationState)">
						<span v-if="thread.conversationState === `open`">Done</span>
						<span v-if="thread.conversationState === `closed`">Open</span>
					</button>
				</div>
			</div>
		</div>

		<nav class="user-tab-bar">
			<ul>
				<li class="tab-item"><a :class="{ active: userTab === `messages` }" @click="showUserMessages()"><span>Messages</span></a></li>
				<li class="tab-item"><a :class="{ active: userTab === `settings` }" @click="showUserSettings()"><span>Settings</span></a></li>
			</ul>
		</nav>

		<div class="user-settings" v-show="userTab === `settings`">
			<h3>Scheduled flows</h3>
			<p v-show="Object.keys(scheduledFlows).length === 0">No flows have been scheduled.</p>
			<table v-show="Object.keys(scheduledFlows).length">
				<thead>
					<tr>
						<th>Flow</th>
						<th>Runs every</th>
						<th>Run time</th>
						<th>Next run</th>
						<th>Ignore days</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="scheduledFlow in scheduledFlows" :class="{ unsaved: scheduledFlow.unsaved }">
						<td>
							<label>Flow: <select v-model="scheduledFlow.flow._id" @change="changedScheduledFlow(scheduledFlow)">
								<option v-for="(flowToSchedule, flowId) in schedulableFlows" :value="flowId">{{flowToSchedule.name}}</option>
							</select></label>
						</td>
						<td><input type="text" v-model="scheduledFlow.runEvery" size="8" @input="changedScheduledFlow(scheduledFlow)"/></td>
						<td><input type="text" v-model="scheduledFlow.runTime" placeholder="HH:MM" size="5" @input="changedScheduledFlow(scheduledFlow)"/></td>
						<td><input type="text" v-model="scheduledFlow.nextRunDate" size="11" @input="changedScheduledFlow(scheduledFlow)"/></td>
						<td>
							<div v-for="(isoDay, dayName) in days" :key="dayName"><label>
								<input type="checkbox" @change="toggleIgnoreDay(isoDay, scheduledFlow)"
								 :checked="scheduledFlow.ignoreDays.includes(isoDay)"
								 :value="isoDay" /> {{dayName}} </label></div>
						</td>
						<td class="save-info">
							<p v-if="scheduledFlow.unsaved">There are unsaved changes</p>
							<button class="mini primary" :disabled="!scheduledFlow.unsaved" @click="saveScheduledFlow(scheduledFlow)">Save</button>
						</td>
					</tr>
				</tbody>
			</table>

			<h3>Memory</h3>
			<table>
				<thead>
					<tr>
						<th>Key</th>
						<th>Value</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="([ memoryKey, memoryValue ]) in botMemoriesSet">
						<td>{{memoryKey}}</td>
						<td>{{memoryValue}}</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div id="message-list" class="messages" v-scroll="onScroll" v-show="userTab === `messages`">
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

		<div class="composer" v-show="userTab === `messages`">
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
				<button class="shrunk" @click="sendMessageViaSendButton(thread.itemId)">Send</button>
			</div>
		</div>

	</div>

</template>

<script>

	import moment from 'moment';
	import { mapGetters } from 'vuex';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';
	import Message from './Message';
	import Vue from 'vue';

	export default {
		props: [ `botEnabled` ],
		data: function () {
			return {
				loadingState: 0,
				loadingRoute: ``,
				lastScrollTop: 0,
				loadedAllMessages: false,
				providerPhotoUrl: APP_CONFIG.providerPhotoUrl,
				scheduledFlows: [],
				schedulableFlows: {},
				userTab: `messages`,
				days: {
					'Monday': 1,
					'Tuesday': 2,
					'Wednesday': 3,
					'Thursday': 4,
					'Friday': 5,
					'Saturday': 6,
					'Sunday': 7,
				},
			};
		},
		components: { Message },
		computed: {

			...mapGetters([
				`messageSet`,
				`botMemoriesSet`,
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

			fetchUserSettings () {

				const itemId = this.$route.params.itemId;

				getSocket().emit(
					`messaging/pull-user-settings`,
					{ userId: itemId },
					resData => {

						this.$data.scheduledFlows = resData.scheduledFlows;
						this.$data.schedulableFlows = resData.flows;

					});

			},

			fetchComponentData (loadOlderMessages = false) {

				return new Promise((resolve) => {

					if (!setLoadingStarted(this, loadOlderMessages, true)) {
						resolve();
						return;
					}

					const threadId = this.$route.params.itemId;
					let breakPointMessageId;

					if (loadOlderMessages) {
						const $messageList = document.getElementById(`message-list`);
						const $messages = $messageList.getElementsByClassName(`message`);

						breakPointMessageId = $messages[0].getAttribute(`data-item-id`);
					}

					// Messages.
					getSocket().emit(
						`messaging/thread/get-messages`,
						{ threadId, breakPointMessageId, pageInitialSize: APP_CONFIG.pageInitialSize },
						resData => {

							setLoadingFinished(this);

							if (!resData || !resData.success) {
								alert(`There was a problem loading the thread's messages.`);
								resolve();
								return;
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

							resolve();

						}
					);

					// Bot memories.
					getSocket().emit(
						`messaging/thread/get-bot-memories`,
						{ threadId },
						resData => {

							if (!resData || !resData.success) {
								return;
							}

							this.$store.commit(`update-bot-memories`, {
								// keyField: `key`,
								data: resData.botMemories,
								// sortField: `key`,
								// sortDirection: `desc`,
							});

						}
					);

				});

			},

			saveScheduledFlow (scheduledFlow) {
				getSocket().emit(
					`schedules/update`,
					{ scheduled: scheduledFlow },
					data => {
						if (!data || !data.success) {
							alert(`There was a problem updating the scheduled flow.`);
						}
						else {
							Vue.delete(scheduledFlow, `unsaved`);
						}
					});
			},

			changedScheduledFlow (scheduledFlow) {
				Vue.set(scheduledFlow, `unsaved`, true);
			},

			toggleIgnoreDay (isoDayString, scheduledFlow) {
				let ignoreDays = scheduledFlow.ignoreDays;
				if (!Array.isArray(ignoreDays)) {
					Vue.set(scheduledFlow, `ignoreDays`, []);
					ignoreDays = scheduledFlow.ignoreDays;
				}
				const isoDay = Number(isoDayString);
				if (ignoreDays.includes(isoDay)) {
					ignoreDays.splice(ignoreDays.indexOf(isoDay), 1); // remove
				}
				else {
					ignoreDays.push(isoDay); // add
				}
				// now mark scheduled flow as updated
				this.changedScheduledFlow(scheduledFlow);
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

			setThreadState (itemId, oldState) {

				const newState = (oldState === `open` ? `closed` : `open`);

				// Update the thread state in the UI.
				this.$store.commit(`update-thread`, {
					key: itemId,
					dataFunction: thread => {
						const changes = { conversationState: newState };
						if (newState === `closed`) { changes.botEnabled = true; }
						return {
							...thread,
							...changes,
						};
					},
				});

				// Update the bot memory property.
				const hasConversationStateProperty = this.$store.getters.hasBotMemory(`conversationState`);
				const botMemoryAction = (hasConversationStateProperty ? `update-bot-memory` : `add-bot-memory`);

				this.$store.commit(botMemoryAction, {
					key: `conversationState`,
					data: newState,
				});

				// Update the thread state.
				getSocket().emit(
					`messaging/thread/set-state`,
					{ itemId, conversationState: newState },
					data => (!data || !data.success ? alert(`There was a problem updating the conversation state.`) : void (0))
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

				// Update the thread state in the UI.
				this.$store.commit(`update-thread`, {
					key: itemId,
					dataFunction: thread =>
						Object({
							...thread,
							conversationState: `open`,
							botEnabled: false,
						}),
				});

				// Send the message (also disables the bot and opens the conversation).
				getSocket().emit(
					`messaging/thread/send-message`,
					{ itemId, messageText },
					data => (!data || !data.success ? alert(`There was a problem sending your message.`) : void (0))
				);

			},

			sendMessageViaSendButton (itemId) {
				this.selectTextInput();
				this.sendMessage(itemId);
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

			showUserSettings () {
				this.$data.userTab = `settings`;
			},

			showUserMessages () {
				this.$data.userTab = `messages`;
			},

		},
		beforeRouteLeave (to, from, next) {
			if (
				Object.values(this.scheduledFlows).filter(flow => flow.unsaved).length === 0 ||
				confirm(`Do you really want to leave? You have unsaved changes!`)
			) {
				return next();
			}
			else {
				return next(false);
			}
		},
		watch: {

			$route: {
				handler: function () {
					this.fetchComponentData(false);
					this.fetchUserSettings();
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
			},

		},
		beforeDestroy () {
			this.$store.commit(`remove-all-messages`);
			this.$store.commit(`remove-all-bot-memories`);
		},
	};

</script>

<style lang="scss" scoped>

	.panel {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		background-color: #eeeeee;
		border: 1px solid #E7E7E7;
		border-left: none;

		>nav.user-tab-bar {
			flex-shrink: 0;
			height: 2.5rem;
			@include user-select-off();

			ul {
				display: flex;
				flex: 1;
				padding: 0;
				width: 300px;
				background-color: $brand-main-color;
				margin: 10px 10px 0;
				height: 40px;
			}

			.tab-item {
				display: flex;
				flex: 1;
				height: 2.5rem;
				text-align: center;

				a {
					display: flex;
					flex: 1;
					text-align: center;
					text-decoration: none;
					text-transform: none;
					letter-spacing: 1px;
					cursor: pointer;
					transition: all ease-in-out 200ms;
					border: 1px solid #E7E7E7;
					background-color: white;
					color: #6F6F6F;

					&:hover {
						opacity: 1;
						background: darken(white, 5%);
					}

					&.active {
						font-weight: bold;
						color: white;
						background-color: $brand-main-color;
						z-index: 1;
					}

					>span {
						margin: auto;
						font-size: 15px;
						letter-spacing: 0;
					}
				}
			}
		}

		>.toolbar {
			display: flex;
			height: 60px;
			line-height: 60px;
			background-color: white;
			border-bottom: 1px solid #E7E7E7;

			>.image {
				display: flex;
				flex-shrink: 0;
				width: 3.50rem;
				margin-left: 0.50rem;
				margin-right: 0.50rem;

				>.image-circle {
					display: block;
					margin: auto;
					width: 2.7rem;
					height: 2.7rem;
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
				font-weight: 400;
				font-size: 18px;
				color: #232323;
			}

			>.enquiry-type {
				flex-shrink: 0;
				font-style: italic;
				font-size: 16px;
				font-weight: 400;
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

		>.user-settings {
			padding: 1rem;
			flex: 1;
			position: relative;
			top: 10px;
			margin: 0 10px 20px;
			background-color: white;
			@include scroll-vertical();

			h3 {
				margin: 16px 0 0;
				font-size: 16px;
				color: #232323;
			}

			p {
				font-size: 14px;
				margin: 0;
				color: #838383;
			}

			table {
				background-color: #fff;
				border-collapse: collapse;
				border: 1px solid #888;
				margin-top: 10px;

				tr {
					&.unsaved {
						background-color: #fed;
					}

					th, td {
						border: 1px solid #d9d9d9;
						padding: 0.5rem;
						text-align: center;
						font-size: 14px;

						&.save-info {
							font-weight: bold;
							font-size: 0.8rem;
							width: 8rem;
						}
					}

					td {
						color: #838383;
					}
				}
			}
		}

		>.messages {
			position: relative;
			flex: 1;
			padding: 1.00rem;
			overflow-y: auto;
			margin: 0 10px;
			background-color: white;
			top: 10px;

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
			border-top: 1px solid #E7E7E7;
			z-index: 10;
			margin: 0 10px 10px;
			background-color: white;

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
