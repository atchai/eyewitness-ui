<!--
	SCREEN: FLOWS
-->

<template>

	<div :class="{ screen: true, padding: true, loading: (loadingState > 0) }">
		<dialog id="export-flows">
			<h1>Export flows</h1>
			<button class="mini" @click="selectAllExport()">{{selectedExportFlows.length === flowsSet.length ? "Unselect" : "Select"}} all</button>
			<ul class="export-flow-select">
				<li v-for="flow in flowsSet"><label><input type="checkbox" v-model="selectedExportFlows" :value="flow.flowId" @click="selectExportFlow(flow.flowId)"/> {{flow.name}}</label></li>
			</ul>

			<div class="actions">
				<button class="" @click="cancelExport()">Cancel</button>
				<button class="primary" @click="exportSelected()" :disabled="selectedExportFlows.length === 0">Download Export File</button>
			</div>
		</dialog>

		<dialog id="import-flows">
			<h1>Import flows</h1>


			<label>Select export file: <input ref="importFile" type="file" accept=".json" @change="onFileChange()"/></label>

			<div v-show="importPreview">
				The following flows will be imported:
				<ul class="import-preview">
					<li v-for="flowPreview in importPreview">
						"{{flowPreview.flow.name}}"
						<strong v-if="flowPreview.override">(will override existing flow)</strong>
					</li>
				</ul>
			</div>

			<div class="actions">
				<button class="" @click="cancelImport()">Cancel</button>
				<button class="primary" @click="importFlows()" :disabled="!importFile">Import</button>

			</div>
		</dialog>

		<ScreenLoader />
		<div class="actions dialog_openers">
			<button class="" @click="showExport()">Export Flows...</button>
			<button class="" @click="showImport()">Import Flows...</button>
		</div>
		<ScreenHeader
			title="Flows"
		/>

		<div>
			<p v-if="startingFlow">Starting flow: {{startingFlow.name}}</p>
			<p v-else>No starting flow has been set. Enter reference '/' to set the starting flow.</p>
		</div>

		<div class="flows">
			<Flow
				v-for="flow in flowsSet"
				:key="flow.flowId"
				:flow-id="flow.flowId"
				:initial-name="flow.name"
				:initial-uri="flow.uri"
				:unsaved="flow.unsaved"
				:num-actions="flow.actions ? flow.actions.length : 0"
			/>
		</div>
		<div class="actions">
			<button class="primary" @click="addFlow">Add Flow</button>
		</div>
	</div>

</template>

<script>
	import ObjectId from 'bson-objectid';
	import { mapGetters } from 'vuex';
	import ScreenHeader from '../../common/ScreenHeader';
	import ScreenLoader from '../../common/ScreenLoader';
	import Flow from './Flow';
	import { getSocket } from '../../../scripts/webSocketClient';
	import { setLoadingStarted, setLoadingFinished } from '../../../scripts/utilities';
	import dialogPolyfill from 'dialog-polyfill';

	export default {
		data: function () {
			return {
				loadingState: 0,
				loadingRoute: ``,
				selectedExportFlows: [],
				importFile: null,
				importPreview: null,
			};
		},
		components: { ScreenHeader, ScreenLoader, Flow },
		computed: {
			...mapGetters([
				`flowsSet`, `flows`,
			]),
			startingFlow: function () {
				const startingFlows = this.flowsSet.filter(flow => flow.uri === `dynamic:///`);
				return startingFlows.length ? startingFlows[0] : null;
			},
		},
		mounted: function () {
			dialogPolyfill.registerDialog(document.getElementById(`import-flows`));
			dialogPolyfill.registerDialog(document.getElementById(`export-flows`));
		},
		beforeRouteLeave (to, from, next) {
			if (this.$children.filter(child => child.saved === false).length === 0 ||
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
						}
						else {
							// Replace all of the flows.
							this.$store.commit(`update-flows`, { data: resData.flows });
						}
					}
				);
			},

			addFlow () {
				const newId = new ObjectId().toString();

				this.$store.commit(`add-flow`, {
					key: newId,
					data: {
						flowId: newId,
						name: ``,
						actions: [],
						interruptionsWhenAgent: `ask-user`,
						interruptionsWhenSubject: `ask-user`,
						unsaved: true,
					},
				});
			},

			showExport () {
				document.getElementById(`export-flows`).showModal();
			},

			cancelExport () {
				document.getElementById(`export-flows`).close();
			},

			showImport () {
				document.getElementById(`import-flows`).showModal();
			},

			cancelImport () {
				document.getElementById(`import-flows`).close();
			},

			selectExportFlow (exportFlowId) {
				if (this.selectedExportFlows.includes(exportFlowId)) {
					// unselect
				}
				else {
					// select
					let referencedFlowUris = [];
					if (this.flows[exportFlowId].nextUri) {
						referencedFlowUris.push(this.flows[exportFlowId].nextUri);
					}

					// find all flows referenced by load actions
					const actions = this.flows[exportFlowId].actions;
					referencedFlowUris = referencedFlowUris.concat(
						actions.filter(action => action.nextUri).map(action => action.nextUri));

					// find all flows referenced by prompts with load actions or a nextUri
					const prompt = this.flows[exportFlowId].prompt;
					if (prompt) {
						referencedFlowUris = referencedFlowUris.concat(
							prompt.options
								.filter(option => option.nextUri)
								.map(option => option.nextUri));
						if (prompt.nextUri) {
							referencedFlowUris.push(prompt.nextUri);
						}
					}

					// remove any duplicates
					referencedFlowUris = new Set(referencedFlowUris);
					// remove current flow if present
					referencedFlowUris.delete(this.flows[exportFlowId].uri);
					// remove any flows already selected
					referencedFlowUris = Array.from(referencedFlowUris)
						.filter(flowUri => {
							const referencedFlow = Object.values(this.flows).filter(flow => flow.uri === flowUri).pop();
							return !this.selectedExportFlows.includes(referencedFlow.flowId);
						});

					if (referencedFlowUris.length) {
						let selectOthersMessage = `${referencedFlowUris.length} other flows are referenced from this flow:\n\n - `;
						selectOthersMessage += referencedFlowUris.map(flowUri => {
							const referencedFlow = Object.values(this.flows).filter(flow => flow.uri === flowUri).pop();
							return referencedFlow.name;
						}).join(`\n - `);
						selectOthersMessage += `\n\nSelect those also?`;
						if (confirm(selectOthersMessage)) {
							referencedFlowUris.forEach(flowUri => {
								const referencedFlow = Object.values(this.flows).filter(flow => flow.uri === flowUri).pop();
								this.selectedExportFlows.push(referencedFlow.flowId);
								this.selectExportFlow(referencedFlow.flowId);
							});
						}
					}

				}
			},

			selectAllExport () {
				if (this.flowsSet.length === this.selectedExportFlows.length) {
					// unselect all
					this.selectedExportFlows.splice(0, this.selectedExportFlows.length);
				}
				else {
					// select all
					this.flowsSet.forEach(flow => !this.selectedExportFlows.includes(flow.flowId) &&
					this.selectedExportFlows.push(flow.flowId));
				}
			},

			// See https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
			b64EncodeUnicode (str) {
				// first we use encodeURIComponent to get percent-encoded UTF-8,
				// then we convert the percent encodings into raw bytes which
				// can be fed into btoa.
				return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
					(match, p1) => String.fromCharCode(`0x${p1}`)));
			},

			exportSelected () {
				const selectedFlows = this.selectedExportFlows.map(flowId => this.flows[flowId]);
				const link = document.createElement(`a`);
				link.download = `flow-export${new Date().toISOString().substr(0, 16)}.json`;
				link.href = `data:application/json;base64,${this.b64EncodeUnicode(JSON.stringify(selectedFlows))}`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			},

			onFileChange () {
				const files = this.$refs.importFile.files;
				this.importFile = files[0];
				const reader = new FileReader();
				reader.onload = (loadEvent) => {
					const flowsToImport = JSON.parse(loadEvent.target.result);
					this.importPreview = flowsToImport.map(flow => ({
						override: (this.flows[flow.flowId]) || this.flowsSet.find(existingFlow => existingFlow.name === flow.name),
						flow,
					}));
				};
				reader.readAsText(this.importFile);
			},

			importFlows () {
				const reader = new FileReader();
				reader.onload = (loadEvent) => {
					const flowsToImport = JSON.parse(loadEvent.target.result);
					flowsToImport.forEach(importFlow => {
						importFlow.actions.forEach(action => delete action.__v);
						const existingFlow = this.flowsSet.find(flow => flow.name === importFlow.name);
						if (existingFlow && existingFlow.flowId !== importFlow.flowId) {
							// name matches but ID does not, so manually delete old flow
							this.$store.commit(`remove-flow`, {
								key: existingFlow.flowId,
							});
							getSocket().emit(
								`flows/remove`,
								{ flowId: existingFlow.flowId },
								data => {
									if (!data || !data.success) {
										alert(`There was a problem removing the flow ${existingFlow.name}.`);
									}
								}
							);
						}
						this.$store.commit(`add-flow`, {
							key: importFlow.flowId,
							data: importFlow,
						});
						getSocket().emit(
							`flows/update`,
							this.flows[importFlow.flowId],
							data => {
								if (!data || !data.success) {
									alert(`There was a problem saving flow "${importFlow.name}".`);
								}
								else {
									// console.log(`Imported flow ${flow.name}`);
								}
							}
						);
					});
					document.getElementById(`import-flows`).close();
				};
				reader.readAsText(this.importFile);
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

	.dialog_openers {
		float: right;
	}

	#export-flows {
		.export-flow-select {
			list-style: none;
		}

		.export-flow-select, .import-preview {
			padding: 0.5rem;
			border-radius: 0.2rem;
			max-height: 10rem;
			overflow: auto;
			background-color: #eee;
			border: 1px solid #aaa;
		}

		&#import-flows {
			height: calc(60vh);

			.import-preview {
				padding-left: 2rem;
			}

			input[type="file"] {
				margin-bottom: 2rem;
			}
		}
	}


</style>
