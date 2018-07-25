<template>
	<div class="prompt">
		<h3>Prompt</h3>
		<div class="questions">
			<strong>Questions:</strong>
			<table>
				<tbody>
				<PromptQuestion
					v-for="(promptQuestion, index) in prompt.text"
					:key="index"
					:promptQuestion="promptQuestion"
					:index="index"
					:promptQuestions="prompt.text"
					:memoryKeys="memoryKeys"
				/>
				</tbody>
			</table>
			<button @click="addPromptQuestion()">Add question</button>
		</div>

		<div class="answer">
			<strong>Answer:</strong>
			<div class="answer-details">
				<div>
					<label>Type:
						<select name="promptType" v-model="prompt.uiMeta.answerType" required>
							<option v-for="(promptTypeName, promptTypeKey) in promptTypes" :value="promptTypeKey">{{promptTypeName}}</option>
						</select>
					</label>
				</div>

				<span v-if="prompt.uiMeta.answerType === 'open'">
					<!-- no further options -->
				</span>
				<div v-else-if="prompt.uiMeta.answerType === 'open-selection' || prompt.uiMeta.answerType === 'strict-selection'">
					<table>
						<thead>
						<tr> <th>Quick reply</th> <th>Action</th> <th></th></tr>
						</thead>

						<tbody>
						<PromptOption v-for="(option, index) in prompt.options" :key="index" :index="index" :options="prompt.options" :option="option" :flows="flows"/>
						</tbody>
					</table>
					<button @click="addOption()">Add quick reply</button>
				</div>

				<div class="retry-message">
					Retry message:
					<input type="text" v-model="prompt.errorMessage" size="80" :placeholder="defaultRetryMessage"/>
				</div>
				<div>
					<h3>Memory</h3>
					<FlowMemory
						:validation="validation"
						:memory="prompt.memory"
						:memoryParent="prompt"
						:options="prompt.options"
						:memoryKeys="memoryKeys"
						:isPromptMemory="true"
					/>
				</div>
			</div>
		</div>

		<div class="nextFlow">
			<label>
				<strong>Next Flow (optional):</strong>
				<select v-model="prompt.nextUri">
					<option value=""></option>
					<option v-for="(flowToLoad, flowId) in flows" :value="flowId">{{flowToLoad.name}} - {{flowToLoad.uri}}</option>
				</select>
			</label>
		</div>
	</div>
</template>

<script>
	import PromptQuestion from './PromptQuestion';
	import PromptOption from './PromptOption';
	import FlowMemory from './FlowMemory';
	import ValidationMixin from './validationMixin';
	import Vue from 'vue';

	export default {
		props: [ `prompt`, `memoryKeys`, `flows` ],
		data: function () {
			return {
				promptTypes: {
					open: `Open`,
					'open-selection': `Open Selection`,
					'strict-selection': `Strict Selection`,
				},
				defaultRetryMessage: `Whoops! I didn't understand what you said.`,
			};
		},
		components: { PromptQuestion, PromptOption, FlowMemory },
		mixins: [ ValidationMixin ],
		methods: {
			addPromptQuestion () {
				Vue.set(this.prompt, `text`, this.prompt.text || []);
				this.prompt.text.push({
					conditional: ``,
					value: ``,
				});
			},
			addOption () {
				this.prompt.options.push({
					label: `Yes`,
					uiMeta: {
						actionType: `continue`,
					},
				});
			},
		},
	};
</script>

<style lang="scss" scoped>

	.prompt {
		margin: 1rem;
		margin-left: 2rem;
		padding: 1rem;
		background-color: #eee;
		border-radius: 0.5rem;
	}

	.question textarea {
		width: 100%;
	}

	.questions {
		margin-bottom: 2.00rem;
	}

	.questions table {
		width: 100%;
		border-collapse: collapse;
		border: 1px solid black;
		margin-top: 1.00rem;
		margin-bottom: 1.00rem;
	}

	.question-details, .answer-details {
		margin: 1rem;
		padding: 1rem;
		margin-left: 2rem;
		background-color: #fff;
		border-radius: 0.2rem;
	}

	.answer-details {
		padding: 0;

		.retry-message {

		}

		>div {
			padding: 1rem;
			border-bottom: 1px solid #eee;

			&:last-child {
				border-bottom: none;
			}
		}

		table {
			border-collapse: collapse;
			border: 1px solid #333;
			margin-bottom: 1rem;

			th {
				text-align: center;
				border: 1px solid #333;
			}
		}
	}

</style>
