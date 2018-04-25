<!--
	SCREEN: FLOWS
-->

<template>

	<div :class="{ screen: true, padding: true, loading: (loadingState > 0) }">
		<dialog id="export-flows">
			<h1>Export flows</h1>
			<button class="mini" @click="selectAllExport()">{{selectedExportFlows.length == flowsSet.length ? "Unselect" : "Select"}} all</button>
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
		<div class="flows">
			<Flow
				v-for="flow in flowsSet"
				:key="flow.flowId"
				:flow-id="flow.flowId"
				:initial-name="flow.name"
				:unsaved="flow.unsaved"
				:num-steps="flow.steps ? flow.steps.length : 0"
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
				`flowsSet`, `flows`
			]),
		},
		mounted: function () {
			dialogPolyfill.registerDialog(document.getElementById("import-flows"));
			dialogPolyfill.registerDialog(document.getElementById("export-flows"));
	  },
		beforeRouteLeave(to, from, next) {
			if (this.$children.filter(c => c.saved === false).length === 0
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
						this.$store.commit(`update-flows`, { data: resData.flows });
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
						steps: [],
						interruptionsWhenAgent: `ask-user`,
						interruptionsWhenSubject: `ask-user`,
						unsaved: true,
					},
				});
			},

			showExport () {
				document.getElementById("export-flows").showModal();
			},

			cancelExport () {
				document.getElementById("export-flows").close();
			},

			showImport () {
				document.getElementById("import-flows").showModal();
			},

			cancelImport () {
				document.getElementById("import-flows").close();
			},

			selectExportFlow (flowId) {
				if (this.selectedExportFlows.includes(flowId)) {
					// unselect
				} else {
					// select
					const steps = this.flows[flowId].steps;
					let referencedFlowIds = [];
					// find all flows referenced by load steps
					referencedFlowIds = referencedFlowIds.concat(steps.filter(step => step.stepType === `load`).map(step => step.load._flow));
					// find all flows referenced by schedule steps
					referencedFlowIds = referencedFlowIds.concat(steps.filter(step => step.stepType === `schedule`).map(step => step.schedule._flow));
					// find all flows referenced by prompts with load actions
					referencedFlowIds = referencedFlowIds.concat(
							steps.filter(step => step.stepType === `prompt`)
								.map(step => step.prompt.selections)
								.reduce((allSelections, selections) => allSelections.concat(selections), [])
								.filter(selection => selection.action._flow)
								.map(selection => selection.action._flow));
					// remove any duplicates
					referencedFlowIds = new Set(referencedFlowIds)
					// remove current flow if present
					referencedFlowIds.delete(flowId);
					// remove any flows already selected
					referencedFlowIds = Array.from(referencedFlowIds).filter(flowId => !this.selectedExportFlows.includes(flowId));

					if (referencedFlowIds.length) {
						let selectOthersMessage = `${referencedFlowIds.length} other flows are referenced from this flow:\n\n - `;
						selectOthersMessage += referencedFlowIds.map(flowId => this.flows[flowId].name).join(`\n - `);
						selectOthersMessage += `\n\nSelect those also?`;
						if (confirm(selectOthersMessage)) {
							referencedFlowIds.forEach(flowId => {
								this.selectedExportFlows.push(flowId);
								this.selectExportFlow(flowId);
							});
						}
					}

				}
			},

			selectAllExport () {
				if (this.flowsSet.length === this.selectedExportFlows.length) {
					// unselect all
					this.selectedExportFlows.splice(0, this.selectedExportFlows.length);
				} else {
					// select all
					this.flowsSet.forEach(flow => !this.selectedExportFlows.includes(flow.flowId)
				 		&& this.selectedExportFlows.push(flow.flowId));
				}
			},

			// See https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
			b64EncodeUnicode(str) {
		    // first we use encodeURIComponent to get percent-encoded UTF-8,
		    // then we convert the percent encodings into raw bytes which
		    // can be fed into btoa.
		    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
		        function toSolidBytes(match, p1) {
		            return String.fromCharCode('0x' + p1);
		    }));
			},

			exportSelected () {
				const selectedFlows = this.selectedExportFlows.map(flowId => this.flows[flowId]);
				var link = document.createElement("a");
			  link.download = "flow-export"+new Date().toISOString().substr(0,16)+".json";
			  link.href = "data:application/json;base64,"+this.b64EncodeUnicode(JSON.stringify(selectedFlows));
			  console.log( link.href);
				document.body.appendChild(link);
			  link.click();
			  document.body.removeChild(link);
			},

			onFileChange() {
		    const files = this.$refs.importFile.files;
				this.importFile = files[0];
				const reader = new FileReader();
				reader.onload = (e) => {
					let previewString = "";
					const flowsToImport = JSON.parse(e.target.result);
					this.importPreview = flowsToImport.map(flow => ({
						override: (this.flows[flow.flowId]) || this.flowsSet.find(existingFlow => existingFlow.name === flow.name),
						flow,
					}));
				}
				reader.readAsText(this.importFile);
			},

			importFlows () {
				const reader = new FileReader();
				reader.onload = (e) => {
					const flowsToImport = JSON.parse(e.target.result);
					flowsToImport.forEach(flow => {
						flow.steps.forEach(step => delete step.__v);
						const existingFlow = this.flowsSet.find(existingFlow => existingFlow.name === flow.name);
						if (existingFlow && existingFlow.flowId !== flow.flowId) {
							// name matches but ID does not, so manually delete old flow
							this.$store.commit(`remove-flow`, {
								key: existingFlow.flowId,
							});
							getSocket().emit(
								`flows/remove`,
								{ flowId: existingFlow.flowId },
								data => {
									if (!data || !data.success) {
										alert(`There was a problem removing the flow ${existingFlow.name}.`) ;
									}
								}
							);
						}
						this.$store.commit(`add-flow`, {
							key: flow.flowId,
							data: flow,
						});
						getSocket().emit(
							`flows/update`,
							this.flows[flow.flowId],
							data => {
								if (!data || !data.success) {
									alert(`There was a problem saving flow "${flow.name}".`) ;
								} else {
									// console.log(`Imported flow ${flow.name}`);
								}
							}
						);
						document.getElementById("import-flows").close();
					})
				}
				reader.readAsText(this.importFile);
			}
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

	dialog {
	  border: 1px solid rgba(0, 0, 0, 0.3);
	  border-radius: 6px;
	  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);
		min-width: calc(50vw);

		h1 {
			margin: 0;
			border-bottom: 1px solid #bbb;
			margin-bottom: 1rem;
		}

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
