<!--
	FLOW
-->

<template>

	<div :class="[{ unsaved: !saved }, `flow`]">
		<div>
			<label>Name:</label>
			<input type="text" v-model="name" required @input="updatedFlow" data-field="name" pattern="[\w\/ :-]+" size="30" title="Required, alphanumeric characters, spaces, '-', and ':' only"/><br/>
			<p class="inline-error" v-if="validation.name">{{validation.name}}</p>

			<label>Reference (optional):</label>
			<input type="text" v-model="reference" @input="updatedReference" data-field="reference" pattern="[\w\/-]*" size="30" title="Alphanumeric characters, '-' and '/' only."/>
			<p class="inline-error" v-if="validation.reference">{{validation.reference}}</p>
			<p class="inline-error" v-if="validation.uniqueReference">{{validation.uniqueReference}}</p>

			<div><span class="label">URI:</span><span class="uri">{{uri}}</span> <span class="badge" v-if="uri === `dynamic:///`">Starting Flow</span></div>

			<p>{{numActions}} actions
				<router-link :to="`/flows/${flowId}`" v-show="saved">[Edit]</router-link>
			</p>
		</div>
		<div class="actions">
			<button class="shrunk danger" @click="removeFlow()">Delete</button>
			<button class="shrunk primary" @click="saveFlow()" :disabled="saved">Save</button>
		</div>
	</div>

</template>


<script>

	import { mapGetters } from 'vuex';
	import { getSocket } from '../../../scripts/webSocketClient';
	import Vue from 'vue';
	import ValidationMixin from './validationMixin';

	export default {
		props: {
			flowId: String,
			initialName: String,
			numActions: Number,
			initialUri: {
				type: String,
				default: undefined,
			},
			unsaved: {
				type: Boolean,
				default: false,
			},
		},
		data: function () {
			const reference = (this.initialUri || ``).replace(`dynamic:///`, `/`);

			return {
				name: this.initialName,
				reference,
				saved: !this.unsaved,
			};
		},
		computed: {
			uri: function () {
				return `dynamic://${this.reference.startsWith(`/`) ? `` : `/`}${this.reference || this.flowId}`;
			},
			...mapGetters([
				`flowsSet`,
			]),
		},
		mixins: [ ValidationMixin ],
		methods: {
			removeFlow () {
				if (window.confirm(`Are you sure you want to delete ${this.name ? `flow"${this.name}"` : `this flow`}?`)) {
					this.$store.commit(`remove-flow`, {
						key: this.flowId,
					});

					getSocket().emit(
						`flows/remove`,
						{ flowId: this.flowId },
						data => {
							if (!data || !data.success) {
								alert(`There was a problem removing the flow.`);
							}
						}
					);
				}
			},

			saveFlow () {
				if (document.querySelectorAll(`:invalid`).length) {
					alert(`Cannot save! Some fields have not been set correctly. Please correct and try again.`);
					return;
				}

				const name = this.name.trim();
				const uri = (this.uri && this.uri.trim()) || null;

				// If there is no text lets remove the flow altogether.
				if (!name) {
					this.removeFlow();
					return;
				}

				this.$store.commit(`update-flow`, {
					key: this.flowId,
					dataField: `name`,
					dataValue: name,
				});

				if (uri) {
					this.$store.commit(`update-flow`, {
						key: this.flowId,
						dataField: `uri`,
						dataValue: uri,
					});
				}

				getSocket().emit(
					`flows/update`,
					this.$store.state.flows[this.flowId],
					data => {
						if (!data || !data.success) {
							alert(`There was a problem saving the flow.`);
						}
						else {
							this.saved = true;
						}
					}
				);

			},

			updatedReference (event) {
				if (this.flowsSet.filter(flow => this.flowId !== flow.flowId && this.uri === flow.uri).length) {
					Vue.set(this.validation, `uniqueReference`, `Reference must be unique`);
				}
				else {
					Vue.delete(this.validation, `uniqueReference`);
				}
				this.updatedFlow(event);
			},

			updatedFlow (event) {
				Vue.set(this, `saved`, false);
				this.validate(event);
			},
		},
	};

</script>

<style lang="scss" scoped>

.flow {

	button:first-child {
		margin: 0;
	}

	p:last-child {
		margin-bottom: 0;
		font-size: 14px;
		color: #9e9e9e;
	}

	label, .label {
		font-size: 15px;
		color: #656565;
		display: inline-block;
		min-width: 200px;
		margin-bottom: 16px;
	}

	padding: 2.00rem 2.00rem;
	display: flex;
	flex: 1;
	border-bottom: 1px solid #E7E7E7;

	.inline-error {
		font-size: 0.8rem;
		color: #f33;
	}

	>input[type="text"] {
		line-height: 2rem;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.uri {
		font-family: monospace;
		background-color: #ddd;
		border-radius: 0.5em;
		padding: 0.2em;
		margin: 0.2em;
	}

	>div {
		flex: 3;
		width: 100%;

		&.actions {
			margin-right: 1.00rem;
			margin-left: 1.00rem;
			text-align: right;
			flex: 1;
		}

		.steps {
			text-align: center;
		}
	}

	&.unsaved {
		background-color: #fff9f3;
	}

	.badge {
		background-color: #bdf;
		border-radius: 0.5em;
		padding: 0.5em;
	}
}

</style>
