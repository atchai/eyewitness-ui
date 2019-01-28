<!--
	SCREEN: FLOW ACTIONS
-->

<template>

	<div :class="{ screen: true, padding: true, loading: (loadingState > 0) }">
		<ScreenLoader />
		<div v-if="flow !== null && flow.actions !== null" class="flow-editor">
			<ScreenHeader :title="`Editing flow: ${flow.name}`"/>
			
			<div class="flow-settings">
				<div class="field">
					<label>Name:</label>
					<input 
						type="text" 
						v-model="flow.name" 
						required data-field="name" 
						pattern="[\w\/ :-]+" 
						size="30" 
						title="Required, alphanumeric characters, spaces, '-', and ':' only"/>
				</div>
				
				<div class="field">
					<label>URI:</label> 
					<span class="uri">{{flow.uri}}</span>
				</div>

				<p class="action-total">{{flow.actions.length}} actions<span v-if="flow.prompt">, 1 final prompt</span></p>

				<h3>Flow Interruptions</h3>
				
				<div class="field">
					<label>When being interrupted:</label>
					<select id="interruptionsWhenSubject" v-model="flow.interruptionsWhenSubject" required>
						<option value="ask-user">Ask the user first</option>
						<option value="yes">Allow the interruption</option>
						<option value="no">Prevent the interruption</option>
					</select> (takes precedence)
				</div>
				
				<div class="field">
					<label>When interrupting another flow:</label>
					<select id="interruptionsWhenAgent" v-model="flow.interruptionsWhenAgent" required>
						<option value="ask-user">Ask the user first</option>
						<option value="weak">Let the other flow decide</option>
						<option value="yes">Interrupt without asking</option>
						<option value="no">Don't run this flow</option>
					</select>
				</div>

				<div class="actions">
					<button class="shrunk" @click="saveFlow($event)"  :disabled="saved">Save</button>
				</div>
			</div>
			
			<div class="action-list-header">
				<h2>Action List</h2>
				<div class="actions">
					<button class="shrunk" @click="addAction">Add Action</button>
					<button class="shrunk" v-bind:disabled="flow.prompt" @click="addPrompt">Add Final Prompt</button>
					<button class="shrunk danger" v-bind:disabled="!flow.prompt" @click="removePrompt">Remove Prompt</button>
				</div>
			</div>

			<transition-group  name="flow-action-list" tag="ol" class="action-item">
				<FlowAction v-for="(action, index) in flow.actions" :key="action.shortId" :index="index" :action="action" :flow="flow" :flows="flows" :memoryKeys="memoryKeys"/>
			</transition-group>

			<FlowPrompt v-if="flow.prompt" :prompt="flow.prompt" :memoryKeys="memoryKeys" :flows="flows" />

			<datalist id="memoryKeys">
				<option v-for="memoryKey in memoryKeys" :value="memoryKey"></option>
			</datalist>

			<datalist id="commonMimeTypes">
				<option v-for="mimeType in commonMimeTypes" :value="mimeType"></option>
			</datalist>

			<div class="actions">
				<button class="shrunk" @click="addAction">Add Action</button>
				<button class="shrunk" v-bind:disabled="flow.prompt" @click="addPrompt">Add Final Prompt</button>
				<button class="shrunk" v-bind:disabled="!flow.prompt" @click="removePrompt">Remove Prompt</button>
			</div>
		</div>

		<div class="unsaved-warning" v-if="!saved">
			<p>There are unsaved changes!</p>
			<div class="actions">
				<button class="shrunk" @click="saveFlow($event)"  :disabled="saved">Save</button>
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
	import FlowAction from './FlowAction';
	import FlowPrompt from './FlowPrompt';
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
				commonMimeTypes: [ `image/jpeg`, `image/png`, `image/gif`, `image/gif`,
					`video/mpeg`, `video/webm`, `audio/mpeg3` ],
			};
		},
		components: { ScreenHeader, ScreenLoader, FlowAction, FlowPrompt, draggable },
		computed: {
			memoryKeys () {
				if (this.loadingState >= 0) {
					return [];
				}
				else { // check every action of every flow for possible memory keys
					const allMemory = Object.values(this.flows)
						.map(flow => flow.prompt)
						.filter(prompt => prompt)
						.map(prompt => prompt.memory)
						.filter(memory => typeof memory !== `undefined`)
						.reduce((allMemoryMap, memory) => Object.assign(allMemoryMap, memory), {});

					return [ ...new Set([ ...Object.keys(allMemory) ]) ].sort();
				}
			},
			flow () { return this.$store.state.flows[this.$route.params.flowId] || { actions: [] }; },
			...mapGetters([
				`flows`,
			]),
		},
		beforeRouteLeave (to, from, next) {
			if (this.saved ||
			window.confirm(`Do you really want to leave? You have unsaved changes!`)) {
				next();
			}
			else {
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

						if (!resData || !resData.success) {
							alert(`There was a problem loading the flows tab.`);
							return;
						}

						// Replace all of the flows.
						this.$store.commit(`update-flows`, { data: resData.flows });

						this.$watch(`flow`, () => Vue.set(this, `saved`, false), { deep: true });

						// Trigger hash now that data has loaded in
						if (location.hash) {
							setTimeout(() => document.getElementById(location.hash.substr(1)).scrollIntoView(), 500);
						}
					}
				);
			},

			saveFlow (event) {
				if (document.querySelectorAll(`:invalid`).length) {
					alert(`Cannot save! Some fields have not been set correctly. Please correct and try again.`);
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
						}
						else {
							Vue.set(this, `saved`, true);
						}
					}
				);
			},

			addAction () {
				const flow = this.flow;
				const newId = new ObjectId().toString();
				flow.actions.push({
					_id: newId,
					shortId: shortId.generate(),
					type: `send-message`,
					message: {},
					uiMeta: {
						stepType: `send-message`,
					},
				});
			},

			addPrompt () {
				const flow = this.flow;
				const prompt = {
					type: `basic`,
					errorMessage: ``,
					memory: {},
					text: [{
						value: ``,
						uiMeta: {},
					}],
					options: [],
					uiMeta: {
						answerType: `open`,
					},
				};
				Vue.set(flow, `prompt`, prompt);
			},

			removePrompt () {
				Vue.delete(this.flow, `prompt`);
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
			margin-top: 0.3rem;
		}
	}

	.actions {
		text-align: right;
	}

	.uri {
		font-family: monospace;
		background-color: #ddd;
		border-radius: 0.5em;
		padding: 0.3em 0.7em;
	}


	.flow-editor {
		padding-bottom: 3rem;
	}
	
	.flow-settings {
		background-color: white;
		border: 1px solid #E7E7E7;
		padding: 14px 30px;

		label {
			font-size: 15px;
			color: #656565;
			display: inline-block;
			min-width: 240px;
			margin-bottom: 16px;
		}

		.action-total {
			margin: 0.6rem 0 1.5rem;
			padding-bottom: 1.5rem;
			font-size: 15px;
			color: #656565;
			border-bottom: 1px solid #E7E7E7;
		}

		button {
			margin: 0;
		}

		.actions {
			text-align: right;
		}
	}

	.action-list-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 3rem;
	}

	div.test {
		@include user-select-off();

	  padding: 4px;
	  margin-top: 4px;
	  border: solid 1px;
	  transition: all 1s;
	}

	.flow-action:last-child {
		margin-bottom: 3rem;
	}

	.flow-action-list-move {
	  transition: transform 1s;
	}

	.flow-action-list-enter-active, .flow-action-list-leave-active {
	  transition: all 0.5s;
	}
	.flow-action-list-enter, .flow-action-list-leave-to {
	  opacity: 0;
	}

	input:invalid, select:invalid, textarea:invalid {
		border: 2px solid red;
	}

</style>
