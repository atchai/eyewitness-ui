<!--
	SCREEN: SETTINGS
-->

<template>

	<div class="screen padding">
		<ScreenHeader
			title="Settings"
			description="Welcome messages:"
		/>
		<div class="welcome">
			<WelcomeMessage
				v-for="welcomeMessage in welcomeMessages"
				:key="welcomeMessage.welcomeMessageId"
				:welcomeMessageId="welcomeMessage.welcomeMessageId"
				:text="welcomeMessage.text"
			/>
		</div>
		<div class="actions">
			<button class="primary" @click="addWelcomeMessage">Add Message</button>
		</div>
	</div>

</template>

<script>

	import mongoose from 'mongoose';
	import ScreenHeader from '../../common/ScreenHeader';
	import WelcomeMessage from './WelcomeMessage';

	export default {
		computed: {
			welcomeMessages () { return this.$store.state.welcomeMessages; },
		},
		components: { ScreenHeader, WelcomeMessage },
		methods: {

			addWelcomeMessage () {
				this.$store.commit(`add-welcome-message`, {
					welcomeMessageId: new mongoose.mongo.ObjectId(),
					text: ``,
				});
			},

		}
	};

</script>

<style lang="scss" scoped>

	.screen {

	}

</style>
