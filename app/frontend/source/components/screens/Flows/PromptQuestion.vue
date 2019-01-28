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
					<textarea v-model="promptQuestion.value" required></textarea>
					<details class="inline-help">
						<summary>Available memory keys</summary>
						<ul class="memory-keys">
							<li v-for="memoryKey in memoryKeys" @click="insertMemoryTemplate(memoryKey, index)"><code>{{memoryKey}}</code></li>
						</ul>
					</details>
				</div>
			</div>
		</td>
		<td class="right">
			<button class="mini danger" @click="removePromptQuestion(index)">Remove</button>
		</td>
	</tr>

</template>


<script>

	export default {
		props: [ `promptQuestion`, `index`, `promptQuestions`, `memoryKeys` ],
		data: function () {
			return {};
		},
		methods: {
			removePromptQuestion (index) {
				this.promptQuestions.splice(index, 1);
			},
			insertMemoryTemplate (memoryKey, index) {
				const templateToAppend = `{{{${memoryKey}}}}`;
				this.promptQuestions[index].value = (this.promptQuestions[index].value || ``) + templateToAppend;
			},
		},
	};

</script>

<style lang="scss" scoped>
	textarea:invalid {
		border: 2px solid red;
	}

	tr {
		vertical-align: top;

		&:nth-child(even) {
			background-color: white;
		}

		td {
			border: 1px solid rgba(255, 255, 255, 0);
			border-bottom: 1px solid rgb(223, 223, 223);
			padding: 1.5rem 1rem;
			background-color: #eee;
		}

		td.left {
			width: 12.00rem;
		}

		td.middle textarea {
			width: 100%;
		}

		td.right {
			width: 7.00rem;
			vertical-align: middle;
		}
	}
</style>
