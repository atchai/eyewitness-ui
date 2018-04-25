<!--
	PROMPT QUESTION
-->

<template>

	<tr>
		<td class="left">
			<strong><small>Conditional expression:</small></strong><br />
			<input v-model="promptQuestion.conditional" type="text"/>
		</td>
		<td class="middle">
			<div class="question">
				<strong><small>Question:</small></strong>
				<div class="question-details">
					<textarea v-model="promptQuestion.value" required/></textarea>
					<details class="inline-help">
						<summary>Available memory keys</summary>
						<ul class="memory-keys">
							<li v-for="memoryKey in memoryKeys" @click="insertMemoryTemplate(step, memoryKey, index)"><code>{{memoryKey}}</code></li>
						</ul>
					</details>
				</div>
			</div>
		</td>
		<td class="right">
			<button class="mini" @click="removePromptQuestion(index)">Remove</button>
		</td>
	</tr>

</template>


<script>

	export default {
		props: [`promptQuestion`, `index`, `promptQuestions`, `insertMemoryTemplate`, `memoryKeys`, `step`],
		data: function () {
			return {};
		},
		methods: {
			removePromptQuestion (index) {
				this.promptQuestions.splice(index, 1);
			},
		},
	};

</script>

<style lang="scss" scoped>
	textarea:invalid {
		border: 2px solid red;
	}

	tr {
		&:nth-child(even) {
			background-color: white;
		}

		td {
			border-left: 1px solid #333;
			border-right: 1px solid #333;
			padding: 0.5rem;
		}

		td.left {
			width: 12.00rem;
		}

		td.middle textarea {
			width: 100%;
		}

		td.right {
			width: 7.00rem;
		}
	}
</style>
