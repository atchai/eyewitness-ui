<!--
	SCREEN: SETTINGS
-->

<template>

	<div :class="{ screen: true, padding: true, loading: (loadingState > 0) }">
		<ScreenLoader />

		<div class="settings-edit">
			<ScreenHeader
				title="Settings"
			/>

			<h2>Flows for commands</h2>

			<p>Configure commands to point to specific flows: </p>

			<p><label><code>Get started</code>:
				<select v-model="globalSettings._defaultFlow">
					<option></option>
					<option v-for="(flow, flowId) in flows" :value="flowId">{{flow.name}}</option>
				</select></label></p>

			<p><label><code>stop</code>:
				<select v-model="globalSettings._stopFlow">
					<option></option>
					<option v-for="(flow, flowId) in flows" :value="flowId">{{flow.name}}</option>
				</select></label>
				<span class="inline-help">The stop command removes any scheduled flows for the user, before initiating the selected flow.</span>
			</p>

			<p><label><code>help</code>:
				<select v-model="globalSettings._helpFlow">
					<option></option>
					<option v-for="(flow, flowId) in flows" :value="flowId">{{flow.name}}</option>
				</select></label>
			</p>

			<p><label><code>feedback</code>:
				<select v-model="globalSettings._feedbackFlow">
					<option></option>
					<option v-for="(flow, flowId) in flows" :value="flowId">{{flow.name}}</option>
				</select></label>
			</p>

			<p>The following flows are not configurable:
				<ul>
					<li><code>Do [flow name]</code> and <code>View [flow name]</code> will both load a flow by name.</li>
				</ul>
			</p>

			<div class="actions">
				<button class="primary" @click="saveSettings()" :disabled="saved">Save</button>
			</div>

			<div class="unsaved-warning" v-if="!saved">
				<p>There are unsaved changes!</p>
				<div class="actions">
					<button class="primary" @click="saveSettings($event)"  :disabled="saved">Save</button>
				</div>
			</div>
		</div>
	</div>

</template>

<script>

	import ObjectId from 'bson-objectid';
	import { mapGetters } from 'vuex';
	import ScreenHeader from '../../common/ScreenHeader';
	import ScreenLoader from '../../common/ScreenLoader';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';
	import Vue from 'vue';

	export default {
		data: function () {
			return {
				loadingState: 0,
				loadingRoute: ``,
				saved: true,
			};
		},
		components: { ScreenHeader, ScreenLoader },
		computed: {
			...mapGetters([
				`globalSettings`,
				`flows`,
			]),
		},
		beforeRouteLeave (to, from, next) {
			if ((this.saved && this.$children.filter(c => c.saved === false).length === 0)
				|| window.confirm("Do you really want to leave? You have unsaved changes!")) {
				next();
			} else {
				next(false);
			}
		},
		methods: {
			fetchTabData () {
				if (!setLoadingStarted(this)) { return; }

				getSocket().emit(
					`settings/pull-tab-data`,
					{},
					resData => {
						setLoadingFinished(this);

						if (!resData || !resData.success) { return alert(`There was a problem loading the settings tab.`); }

						this.$store.commit(`update-flows`, { data: resData.flows });
						this.$store.commit(`update-global-settings`, { data: resData.globalSettings || { _id: new ObjectId().toString() } });

						this.$watch('globalSettings', () => Vue.set(this, `saved`, false), { deep: true });
					}
				);
			},

			saveSettings () {
				this.$store.commit(`update-global-settings`, { data: this.globalSettings });

				getSocket().emit(
					`settings/update`,
					this.globalSettings,
					data => {
						if (!data || !data.success) {
							alert(`There was a problem saving settings.`);
						} else {
							Vue.set(this, `saved`, true);
						}
					},
				);
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
		@include scroll-vertical();
	}

	.settings-edit {
		padding-bottom: 3rem;

	}

	code {
		background-color: #def;
		border-radius: 1rem;
		padding: 0.3rem;
		margin: 0.3rem;
	}

	.inline-help {
		font-size: 0.8rem;
		color: #888;
	}

</style>
