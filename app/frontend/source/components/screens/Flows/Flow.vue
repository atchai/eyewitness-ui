<!--
	FLOW
-->

<template>

	<div :class="[{ unsaved: !saved }, `flow`]">
		<label>Name:
		<input type="text" v-model="name" @input="updatedFlow($event)" size="30"/></label><br/>

		<label>URI (optional):
		<input type="text" v-model="uri" @input="updatedFlow($event)" size="30"/></label>

		<p>{{numActions}} actions
			<router-link :to="`/flows/${flowId}`" v-show="saved">[Edit]</router-link>
		</p>
		<div class="actions">
			<button @click="removeFlow()">Delete</button>
			<button class="primary" @click="saveFlow()" :disabled="saved">Save</button>
		</div>
	</div>

</template>


<script>

	import { getSocket } from '../../../scripts/webSocketClient';
	import Vue from 'vue';

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
			return { name: this.initialName, uri: this.initialUri, saved: !this.unsaved };
		},
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

				const name = this.name.trim();
				const uri = this.uri.trim() || null;

				// If there is no text lets remove the flow altogether.
				if (!name) { return this.removeFlow(); }

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

			updatedFlow () {
				Vue.set(this, `saved`, false);
			},
		},
	};

</script>

<style lang="scss" scoped>

.flow {
	padding: 2.00rem 2.00rem;

	>input[type="text"] {
		line-height: 2rem;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	>.actions {
		margin-top: 1.00rem;
		text-align: right;
	}

	&.unsaved {
		background-color: #fed;
	}
}

</style>
