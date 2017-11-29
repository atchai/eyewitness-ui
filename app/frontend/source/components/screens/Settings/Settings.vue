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
				v-for="welcomeMessage in welcomeMessageSet"
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

	import ObjectId from 'bson-objectid';
	import { mapGetters } from 'vuex';
	import ScreenHeader from '../../common/ScreenHeader';
	import WelcomeMessage from './WelcomeMessage';

	export default {
		computed: {
			...mapGetters([
				`welcomeMessageSet`,
			]),
		},
		components: { ScreenHeader, WelcomeMessage },
		methods: {

			addWelcomeMessage () {

				const newId = new ObjectId().toString();

				const welcomeMessages = this.$store.getters.welcomeMessageSet;
				let maxWeight = 0;

				welcomeMessages.forEach(welcomeMessage => {
					if (welcomeMessage.weight > maxWeight) { maxWeight = welcomeMessage.weight; }
				})

				this.$store.commit(`add-welcome-message`, {
					key: newId,
					data: {
						welcomeMessageId: newId,
						text: ``,
						weight: maxWeight + 1,
					},
				});

			},

		}
	};

</script>

<style lang="scss" scoped>

	.screen {

	}

</style>
