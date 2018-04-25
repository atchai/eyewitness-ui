<!--
	SELECTION
-->

<template>

	<tr>
		<td>
			<strong><small>Label:</small></strong><br />
			<input v-model="selection.label" type="text" required/><br /><br />
			<strong><small>Conditional expression:</small></strong><br />
			<input v-model="selection.conditional" type="text"/>
		</td>
		<td>
			<select v-model="selection.action.type" required>
				<option v-for="(actionTypeName, actionTypeKey) in actionTypes" :value="actionTypeKey">{{actionTypeName}}</option>
			</select></label>
			<select v-if="selection.action.type === `load` || selection.action.type === `load-return`" v-model="selection.action._flow" required>
				<option v-for="(flowToLoad, flowId) in flows" :value="flowId">{{flowToLoad.name}}</option>
			</select>
			<template v-if="selectedFlowToLoad">
				<select v-show="selection.action.type === `load` || selection.action.type === `load-return`" v-model="selection.action.step">
					<option></option>
					<option v-for="stepToLoad in selectedFlowToLoad.steps" :value="stepToLoad.shortId">#{{stepToLoad.shortId}} - {{stepToLoad.message || stepToLoad.prompt.text || (stepToLoad.media && stepToLoad.media.filename)}}</option>
				</select>
			</template>
		</td>
		<td>
			<button class="mini" @click="removeSelection(index)">Remove</button>
		</td>
	</tr>

</template>


<script>

	export default {
		props: [`selection`, `index`, `selections`, `flows`],
		data: function () {
			return {
				actionTypes: {
					continue: "Continue",
					skip: "Skip next step",
					stop: "Stop",
					load: "Load",
					'load-return': "Load, then return",
				},
			};
		},
		computed: {
			selectedFlowToLoad: function() {
				return this.flows[this.selection.action._flow];
			},
			selectedStepToLoad: function() {
				return typeof this.selectedFlowToLoad === "undefined"
					? null
					: this.selectedFlowToLoad.steps.find(step => step.shortId === this.selection.action.step);
			}
		},
		methods: {
			removeSelection (index) {
				this.selections.splice(index, 1);
			},
		},
	};

</script>

<style lang="scss" scoped>
	select {
		max-width: 20rem;
	}

	input:invalid, select:invalid {
		border: 2px solid red;
	}

	tr {
		&:nth-child(even) {
			background-color: #eee;
		}

		td {
			border-left: 1px solid #333;
			border-right: 1px solid #333;
			padding: 0.5rem;
		}
	}
</style>
