<!--
	Prompt Option
-->

<template>

	<tr>
		<td>
			<strong><small>Label:</small></strong><br />
			<input v-model="option.label" type="text" required/><br /><br />
			<strong><small>Conditional expression:</small></strong><br />
			<input v-model="option.conditional" type="text"/>
		</td>
		<td>
			<select v-model="option.uiMeta.actionType" required>
				<option v-for="(actionTypeName, actionTypeKey) in actionTypes" :value="actionTypeKey">{{actionTypeName}}</option>
			</select>
			<select v-if="option.uiMeta.actionType === `load` || option.uiMeta.actionType === `load-return`" v-model="option.nextUri" required>
				<option v-for="(flowToLoad, flowId) in flows" :value="flowToLoad.uri">{{flowToLoad.name}}</option>
			</select>
		</td>
		<td>
			<button class="mini" @click="removeOption(index)">Remove</button>
		</td>
	</tr>

</template>


<script>

	export default {
		props: [ `option`, `index`, `options`, `flows` ],
		data: function () {
			return {
				actionTypes: {
					// continue: `Continue`,
					// skip: `Skip next action`,
					stop: `Stop`,
					load: `Load`,
					// 'load-return': `Load, then return`,
				},
			};
		},
		methods: {
			removeOption (index) {
				this.options.splice(index, 1);
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
