<!--
	DIALOG: BREAKING NEWS
-->

<template>

	<dialog id="send-breaking-news">
		<h1>Send Alert</h1>
		<p class="story-title">{{ storyTitle }}</p>
		<p>Send a breaking news push notification to subscribed users with the following text:</p>
		<textarea v-model="breakingNewsText"></textarea>

		<div class="actions">
			<button class="primary" @click="closeDialog()">Cancel</button>
			<button class="" @click="sendBreakingNewsAlert()" :disabled="breakingNewsText.length === 0">Send Alert</button>
		</div>
	</dialog>

</template>

<script>

	import { getSocket } from '../../../scripts/webSocketClient';

	export default {
		data: function () {
			return {
				breakingNewsText: `Breaking news!`,
			};
		},
		props: [ `itemId`, `storyTitle` ],
		methods: {

			sendBreakingNewsAlert () {

				this.$store.commit(`update-story`, {
					key: this.itemId,
					dataField: `priority`,
					dataValue: true,
				});

				getSocket().emit(
					`stories/set-story-priority`,
					{ itemId: this.itemId, messageText: this.breakingNewsText, priority: true },
					data => (!data || !data.success ? alert(`There was a problem sending the breaking news alert.`) : void (0))
				);

				this.closeDialog();

			},

			closeDialog () {
				const $el = document.getElementById(`send-breaking-news`);
				$el.close();
			},

		},
	};

</script>

<style lang="scss" scoped>

	#send-breaking-news {
		.story-title {
			max-width: 50.00rem;
			text-overflow: ellipsis;
			overflow: hidden;
			display: block;
			white-space: nowrap;
			font-weight: bold;
			font-style: italic;
			color: black;
			font-size: 18px;
		}

		textarea {
			width: 100%;
			height: 6.00rem;
			min-height: 6.00rem;
			max-height: 15.00rem;
			margin-bottom: 1.00rem;
			margin-top: 1.00rem;

			&:focus {
				border: 1px solid #E7E7E7;
			}
		}

		button:first-child {
			margin: 0;
		}
	}

</style>
