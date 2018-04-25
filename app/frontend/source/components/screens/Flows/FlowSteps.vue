<!--
	SCREEN: FLOW STEPS
-->

<template>

	<div :class="{ screen: true, padding: true, loading: (loadingState > 0) }">
		<ScreenLoader />
		<div v:if="flow !== null && flow.steps !== null" class="flow-editor">
			<ScreenHeader
				:title="`Editing flow: ${flow.name}`"
			/>
			<label><strong>Name: </strong></label>
			<input type="text" v-model="flow.name" size="30"/>
			<p>{{flow.steps.length}} steps</p>
			<br />
			<p><strong>Flow Interruptions:</strong></p>
			<p>
				When being interrupted:
				<select id="interruptionsWhenSubject" v-model="flow.interruptionsWhenSubject" required>
					<option value="ask-user">Ask the user first</option>
					<option value="yes">Allow the interruption</option>
					<option value="no">Prevent the interruption</option>
				</select>
				(takes precedence)
				<br />
				When interrupting another flow:
				<select id="interruptionsWhenAgent" v-model="flow.interruptionsWhenAgent" required>
					<option value="ask-user">Ask the user first</option>
					<option value="weak">Let the other flow decide</option>
					<option value="yes">Interrupt without asking</option>
					<option value="no">Don't run this flow</option>
				</select>
			</p>
			<br />
			<div class="actions">
				<button class="primary" @click="saveFlow($event)"  :disabled="saved">Save</button>
			</div>
			<hr>

			<!-- <draggable v-model="flow.steps">
				<transition-group>
					<div class="test" v-for="step in flow.steps" :key="step._id">{{step.shortId}}</div>
				</transition-group>
			</draggable> -->

			<transition-group  name="flow-step-list" tag="ol">
			<!-- <draggable :list="flow.steps"> -->
				<FlowStep v-for="(step, index) in flow.steps" :key="step.shortId" :index="index" :step="step" :flow="flow" :flows="flows" :memoryKeys="memoryKeys" :quoteSets="quoteSets"/>
			<!-- </draggable> -->
			</transition-group>

			<div class="actions">
				<button class="primary" @click="addStep">Add Step</button>
			</div>

			<datalist id="memoryKeys">
				<option v-for="memoryKey in memoryKeys" :value="memoryKey"/>
			</datalist>

			<datalist id="commonMimeTypes">
				<option v-for="mimeType in commonMimeTypes" :value="mimeType"/>
			</datalist>
		</div>

		<div class="unsaved-warning" v-if="!saved">
			<p>There are unsaved changes!</p>
			<div class="actions">
				<button class="primary" @click="saveFlow($event)"  :disabled="saved">Save</button>
			</div>
		</div>
	</div>

</template>


<script>
	import ObjectId from 'bson-objectid';
	import shortId from 'shortid';
	import { mapGetters } from 'vuex';
	import ScreenHeader from '../../common/ScreenHeader';
	import ScreenLoader from '../../common/ScreenLoader';
	import FlowStep from './FlowStep';
	import draggable from 'vuedraggable';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';
	import Vue from 'vue';

	export default {
		data: function () {
			return {
				loadingState: 0,
				loadingRoute: ``,
				saved: true,
				commonMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/gif', 'video/mpeg', 'video/webm', 'audio/mpeg3'],
			};
		},
		components: { ScreenHeader, ScreenLoader, FlowStep, draggable },
		computed: {
			memoryKeys () {
				if (this.loadingState >= 0) {
					return [];
				}
				else { // check every step of every flow for possible memory keys
					const allMemory = Object.values(this.flows)
						.map(flow => flow.steps)
						.reduce((allSteps, steps) => allSteps.concat(steps), [])
						.filter(step => step.stepType === `prompt`)
						.map(step => step.prompt.memory)
						.filter(memory => typeof memory !== `undefined`)
						.reduce((allMemory, memory) => Object.assign(allMemory, memory), {});
					const allLoopInterationKeys = Object.values(this.flows)
						.map(flow => flow.steps)
						.reduce((allSteps, steps) => allSteps.concat(steps), [])
						.filter(step => step.loop && step.loop.iterationMemoryKey)
						.map(step => step.loop.iterationMemoryKey);

					return [ ...new Set([ ...allLoopInterationKeys, ...Object.keys(allMemory) ]) ].sort();
				}
			},
			flow () { return this.$store.state.flows[this.$route.params.flowId] || { steps: []}; },
			...mapGetters([
				`flows`,
				`quoteSets`,
			]),
		},
		beforeRouteLeave(to, from, next) {
			if (this.saved
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
					`flows/pull-tab-data`,
					{},
					resData => {

						setLoadingFinished(this);

						if (!resData || !resData.success) { return alert(`There was a problem loading the flows tab.`); }

						// Replace all of the flows.
						this.$store.commit(`update-quote-sets`, { data: resData.quoteSets });
						this.$store.commit(`update-flows`, { data: resData.flows });

						this.$watch('flow', () => Vue.set(this, `saved`, false), { deep: true });

						// Trigger hash now that data has loaded in
						if (location.hash) {
							setTimeout(() => document.getElementById(location.hash.substr(1)).scrollIntoView(), 500);
						}
					}
				);
			},

			saveFlow (event) {
				if (document.querySelectorAll(":invalid").length) {
					alert("Cannot save! Some fields have not been set correctly. Please correct and try again.");
					return;
				}
				this.$store.commit(`update-flow`, {
					key: this.flowId,
					data: this.flow,
				});

				getSocket().emit(
					`flows/update`,
					this.flow,
					data => {
						if (!data || !data.success) {
							alert(`There was a problem saving the flow.`);
						} else {
							Vue.set(this, `saved`, true);
						}
					},
				);
			},

			addStep () {
				const flow = this.flow;
				const newId = new ObjectId().toString();
				flow.steps.push({
					_id: newId,
					shortId: shortId.generate(),
					stepType: `message`,
					prompt: {
						selections: [],
					},
					media: {},
					load: {},
					schedule: {},
					quote: {
						quoteSets: [],
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
		@include scroll-vertical();
	}

	.flow-editor {
		padding-bottom: 3rem;
	}

	div.test {
		@include user-select-off();

	  padding: 4px;
	  margin-top: 4px;
	  border: solid 1px;
	  transition: all 1s;
	}

	.flow-step-list-move {
	  transition: transform 1s;
	}

	.flow-step-list-enter-active, .flow-step-list-leave-active {
	  transition: all 0.5s;
	}
	.flow-step-list-enter, .flow-step-list-leave-to {
	  opacity: 0;
	}

	input:invalid, select:invalid, textarea:invalid {
		border: 2px solid red;
	}

</style>
