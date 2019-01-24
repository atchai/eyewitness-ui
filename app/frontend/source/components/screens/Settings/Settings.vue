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
			
			<div class="container">

				<h2>Flows for commands</h2>
				<p class="subheader">Configure commands to point to specific flows: </p>

				<div class="field">
					<label><code>Get started</code>:</label>
					<select v-model="globalSettings._defaultFlow">
						<option></option>
						<option v-for="(flow, flowId) in flows" :value="flowId">{{flow.name}}</option>
					</select>
				</div>

				<div class="field">
					<label><code>stop</code>:</label>
					<select v-model="globalSettings._stopFlow">
						<option></option>
						<option v-for="(flow, flowId) in flows" :value="flowId">{{flow.name}}</option>
					</select>
					<span class="inline-help">The stop command removes any scheduled flows for the user, before initiating the selected flow.</span>
				</div>

				<div class="field">
					<label><code>help</code>:</label>
					<select v-model="globalSettings._helpFlow">
						<option></option>
						<option v-for="(flow, flowId) in flows" :value="flowId">{{flow.name}}</option>
					</select>
				</div>

				<div class="field">
					<label><code>feedback</code>:</label>
					<select v-model="globalSettings._feedbackFlow">
						<option></option>
						<option v-for="(flow, flowId) in flows" :value="flowId">{{flow.name}}</option>
					</select>
				</div>
				
				<div class="more-info">
					<p>The following flows are not configurable:</p>
					<ul>
						<li><code>Do [flow name]</code> and <code>View [flow name]</code> will both load a flow by name.</li>
					</ul>
				</div>

				<div class="actions">
					<button class="" @click="saveSettings()" :disabled="saved">Save</button>
				</div>

				<div class="unsaved-warning" v-if="!saved">
					<p>There are unsaved changes!</p>
					<div class="actions">
						<button class="shrunk" @click="saveSettings($event)"  :disabled="saved">Save</button>
					</div>
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

						// Add the watcher on the next tick so we give the store chance to update without triggering immediately.
						setTimeout(() => {
							this.$watch('globalSettings', () => Vue.set(this, `saved`, false), { deep: true });
						}, 0);
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
			display: flex;
			justify-content: flex-end;
			@include user-select-off();
		}
		@include scroll-vertical();
	}

	.settings-edit {
		padding-bottom: 3rem;

		h2 {
			margin: 0;
			font-size: 18px;
		}

		.subheader {
			font-size: 15px;
			color: #9c9c9c;
			font-weight: 400;
			margin-bottom: 2.5rem;
			margin-top: 0;
		}

	}

	.container {
		background-color: white;
		border: 1px solid #E7E7E7;
		padding: 14px 30px;
	}

	code {
		background-color: #def;
		border-radius: 1rem;
		padding: 0.3rem 0.6rem;
		margin: 0.3rem;
	}

	.field {
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 60%;
	}	

	.inline-help {
		font-size: 0.8rem;
		color: #888;
		position: absolute;
		left: 60%;
		width: 300px;
	}

	.more-info {
		margin: 2.5rem 0;
	}

</style>
