<!--
	WELCOME MESSAGE
-->

<template>

	<div class="welcome-message">
		<textarea :id="`welcome-message-${welcomeMessageId}`">{{ text }}</textarea>
		<div class="actions">
			<button @click="removeWelcomeMessage(welcomeMessageId)">Delete</button>
			<button class="primary" @click="saveWelcomeMessage(welcomeMessageId, $event)">Save</button>
		</div>
	</div>

</template>

<script>

	import { getSocket } from '../../../scripts/webSocketClient';

	export default {
		props: [`welcomeMessageId`, `text`],
		methods: {

			removeWelcomeMessage (welcomeMessageId) {

				this.$store.commit(`remove-welcome-message`, {
					key: welcomeMessageId,
				});

				getSocket().emit(
					`settings/welcome-message/remove`,
					{ welcomeMessageId },
					data => (!data || !data.success ? alert(`There was a problem removing the welcome message.`) : void (0))
				);

			},

			saveWelcomeMessage (welcomeMessageId, event) {

				const text = document.getElementById(`welcome-message-${welcomeMessageId}`).value.trim();

				// If there is no text lets remove the message altogether.
				if (!text) { return this.removeWelcomeMessage(welcomeMessageId); }

				this.$store.commit(`update-welcome-message`, {
					key: welcomeMessageId,
					dataField: `text`,
					dataValue: text,
				});

				getSocket().emit(
					`settings/welcome-message/update`,
					this.$store.state.welcomeMessages[welcomeMessageId],
					data => (!data || !data.success ? alert(`There was a problem saving the welcome message.`) : void (0))
				);

			},

		},
	};

</script>

<style lang="scss" scoped>

	.welcome-message {
		margin: 2.00rem 0;

		>textarea {
			min-width: 100%;
			max-width: 100%;
			min-height: 5.00rem;
			max-height: 10.00rem;
		}

		>.actions {
			margin-top: 1.00rem;
			text-align: right;
		}
	}

</style>
