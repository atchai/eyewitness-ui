<!--
	SCREEN: SETTINGS
-->

<template>

	<div :class="{ screen: true, padding: true, loading: (loadingState > 0) }">
		<ScreenLoader />
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
	import ScreenLoader from '../../common/ScreenLoader';
	import WelcomeMessage from './WelcomeMessage';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';

	export default {
		data: function () {
			return {
				loadingState: 0,
				loadingRoute: ``,
			};
		},
		components: { ScreenHeader, ScreenLoader, WelcomeMessage },
		computed: {
			...mapGetters([
				`welcomeMessageSet`,
			]),
		},
		methods: {

			fetchTabData () {

				if (!setLoadingStarted(this)) { return; }

				getSocket().emit(
					`settings/get-tab-data`,
					{},
					resData => {

						setLoadingFinished(this);

						if (!resData || !resData.success) { return alert(`There was a problem loading the settings tab.`); }

						// Replace all of the welcome messages.
						this.$store.commit(`update-welcome-messages`, { data: resData.welcomeMessages });

					}
				);

			},

			addWelcomeMessage () {

				const newId = new ObjectId().toString();
				const welcomeMessages = this.$store.getters.welcomeMessageSet;
				let maxWeight = 0;

				// Figure out the next weight value to use.
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

		},
		watch: {

	    $route: {
				handler: `fetchTabData`,
				immediate: true,
			},

	  },
	};

</script>

<style lang="scss" scoped>

	.screen {
		.actions {
			@include user-select-off();
		}
	}

</style>
