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
				<span class="label">Show Stories:</span>
				<div :class="{ 'tag': true, 'on': thread.botEnabled }">
					<span v-if="thread.botEnabled">Enabled</span>
					<span v-if="!thread.botEnabled">Disabled</span>
				</div>
				<a href="JavaScript:void(0);" v-if="thread.botEnabled" @click="setBotDisabled(thread.threadId)"><span >disable</span></a>
				<a href="JavaScript:void(0);" v-if="!thread.botEnabled" @click="setBotEnabled(thread.threadId)"><span>enable</span></a>
			</div>
		</div>

		<div class="messages">
			<div class="top-ruler">
				<div class="rule"></div>
				<div class="label">{{ numOldMessagesLoadedText }}</div>
				<div class="rule"></div>
			</div>
			<Message
				v-for="message in thread.messages"
				:key="message.messageId"
				:messageId="message.messageId"
				:direction="message.direction"
				:humanToHuman="message.humanToHuman"
				:sentAt="message.sentAt"
				:data="message.data"
			/>
		</div>

		<div class="composer">
			<div class="image" @click="selectTextInput"><img src="providerImageUrl"></div>
			<div class="text-input" @click="selectTextInput"><textarea id="composer-text-input" placeholder="Write a reply..."></textarea></div>
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

	import { getSocket } from '../../../scripts/webSocketClient';
	import Message from './Message';

	export default {
		props: [`botEnabled`],
		components: { Message },
		computed: {

			thread () { return this.$store.state.threads[this.$route.params.threadId] || {}; },

			providerImageUrl () { return ``; },

			numOldMessagesLoadedText () {

				const maxOldThreadMessages = this.$store.state.maxOldThreadMessages;
				const loadedMaxMessages = (this.thread.messages && this.thread.messages.length >= maxOldThreadMessages);

				if (loadedMaxMessages) {
					return `Loaded ${maxOldThreadMessages} old message${maxOldThreadMessages !== 1 ? `s` : ``}`;
				}
				else {
					return `Loaded all messages`;
				}

			},

		},
		methods: {

			setBotEnabled (threadId) {

				this.$store.commit(`update-thread`, {
					key: threadId,
					dataField: `botEnabled`,
					dataValue: true,
				});

				getSocket().emit(
					`thread/set-bot-enabled`,
					{ threadId, enabled: true },
					data => (!data || !data.success ? alert(`There was a problem enabling the user's bot.`) : void (0))
				);

			},

			setBotDisabled (threadId) {

				this.$store.commit(`update-thread`, {
					key: threadId,
					dataField: `botEnabled`,
					dataValue: false,
				});

				getSocket().emit(
					`thread/set-bot-enabled`,
					{ threadId, enabled: false },
					data => (!data || !data.success ? alert(`There was a problem disabling the user's bot.`) : void (0))
				);

			},

			selectTextInput () {
				document.getElementById(`composer-text-input`).focus();
			},

		},
		data: function () {
			return {

			};
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
			flex: 1;
			padding: 1.00rem;
			overflow-y: auto;

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

			>.image {
				display: flex;
				flex-shrink: 0;
				width: 5.00rem;
				cursor: text;

				>img {
					width: 4.00rem;
					max-height: 4.00rem;
					margin: auto;
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
