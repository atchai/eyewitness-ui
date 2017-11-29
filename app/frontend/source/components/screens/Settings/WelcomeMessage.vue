<!--
	WELCOME MESSAGE
-->

<template>

	<div class="welcome-message">
		<textarea>{{ text }}</textarea>
		<div class="actions">
			<button @click="removeWelcomeMessage(welcomeMessageId)">Delete</button>
			<button class="primary" @click="saveWelcomeMessage(welcomeMessageId, $event)">Save</button>
		</div>
	</div>

</template>

<script>

	export default {
		props: [`welcomeMessageId`, `text`],
		methods: {

			removeWelcomeMessage (key) {
				this.$store.commit(`remove-welcome-message`, { key });
			},

			saveWelcomeMessage (welcomeMessageId, event) {

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
