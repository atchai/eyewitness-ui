<!--
	FLOWSTEP
-->

<template>

	<li class="flow-step">
		<div :id="action.shortId"><a :href="`#${action.shortId}`" class="uid">#{{action.shortId}}</a></div>

		<div><label>Type: <select name="type" v-model="action.type" @change="changeActionType()" required>
			<option v-for="(typeName, typeKey) in types" :key="typeKey" :value="typeKey">{{typeName}}</option>
		</select></label></div>

		<div class="conditional">
			<label><input type="checkbox" :checked="action.conditional && action.conditional.operator" @change="toggleConditional()"/> Conditional </label>
			<div v-if="action.conditional && action.conditional.operator">
				<label>
					Only run this action if
					<select :name="action.shortId + `_conditionalMatchType`" v-model="action.conditional.matchType" required>
						<option value="memory-key">memory key:</option>
						<option value="expression">expression is true:</option>
					</select>
					<input :name="action.shortId + `_conditionalMemoryKey`" v-model="action.conditional.memoryKey" size="30" type="text" :required="action.conditional.matchType === `memory-key`" v-show="action.conditional.matchType === `memory-key`" pattern="[A-Za-z0-9_/]+" list="memoryKeys" data-field="conditionalMemoryKey" @input="validate" title="Required - alphanumeric characters and underscores only" />
					<input :name="action.shortId + `_conditionalExpression`" v-model="action.conditional.expression" size="70" type="text" :required="action.conditional.matchType === `expression`" v-show="action.conditional.matchType === `expression`" pattern=".+" @input="validate" />
					<p class="inline-error" v-if="validation.conditionalMemoryKey">{{validation.conditional}}</p>
				</label>
				<select :name="action.shortId + `_conditionalOperator`" v-model="action.conditional.operator" :required="action.conditional.matchType === `memory-key`" v-show="action.conditional.matchType === `memory-key`">
					<option v-for="(operatorString, operatorKey) in conditionalOperators" :value="operatorKey">{{operatorString}}</option>
				</select>
				<input :name="action.shortId + `_conditionalValue`" type="text" v-model="action.conditional.value" :required="showConditionalValueField(action)" v-show="showConditionalValueField(action)"/>
			</div>
		</div>

		<div class="step-type-specifics">

			<div v-if="action.type === 'message'">
				<textarea class="message" v-model="action.message" required/></textarea>
				<details class="inline-help">
					<summary>Available memory keys</summary>
					<ul class="memory-keys">
						<li v-for="memoryKey in memoryKeys" @click="insertMemoryTemplate(action, memoryKey)"><code>{{memoryKey}}</code></li>
					</ul>
				</details>
			</div>

			<div v-else-if="action.type === 'media'">
				<div class="file-upload" v-if="!action.media.url">
					<label>Upload a media file: <input type="file" :id="`file-upload-${action.shortId}`"/></label>
					<button class="mini" @click="uploadMedia($event, index)">Upload
						<div class="spinner">
						  <div class="bounce1"></div>
						  <div class="bounce2"></div>
						  <div class="bounce3"></div>
						</div>
					</button>
					<p class="inline-help">Alternatively, configure manually below.</p>
				</div>
				<div v-else>
					<button class="mini" @click="deleteMedia(index)">Delete File</button>
				</div>

				<div><label>Media URL: <input type="url" v-model="action.media.url" size="50"/></label></div>
				<div>
					<label>Filename: <input type="text" v-model="action.media.filename"/></label>
					<span class="inline-help">It is best to include a file extension as it may help determine the file type.</span>
				</div>
				<div><label>MIME Type: <input type="text" v-model="action.media.type" list="commonMimeTypes"/></label>
					<span class="inline-help">This may help determine the type of file being sent.</span>
				</div>
				<img class="media-preview" v-if="action.media.url && action.media.type.includes(`image`)" :src="action.media.url"/>
			</div>

			<div v-else-if="action.type === 'load'">
				<label>
					<strong>Flow:</strong>
					<select v-model="action.load._flow" required>
						<option v-for="(flowToLoad, flowId) in flows" :value="flowId">{{flowToLoad.name}}</option>
					</select>
				</label>
				<select v-if="action.load._flow" v-model="action.load.step">
					<option v-for="actionToLoad in flows[action.load._flow].actions" :value="actionToLoad.shortId">#{{actionToLoad.shortId}} - {{actionToLoad.message || actionToLoad.prompt.text || actionToLoad.media.filename}}</option>
				</select>
				<br />
				<br />
				<label>
					<input type="checkbox" v-model="action.load.returnAfter" :checked="action.load.returnAfter" />
					Return here after the loaded flow has finished.
				</label>
			</div>

			<div v-else-if="action.type === 'prompt'">
				<div class="questions">
					<strong>Questions:</strong>
					<table>
						<tbody>
							<PromptQuestion
								v-for="(promptQuestion, index) in action.prompt.text"
								:key="index"
								:promptQuestion="promptQuestion"
								:index="index"
								:promptQuestions="action.prompt.text"
								:insertMemoryTemplate="insertMemoryTemplate"
								:memoryKeys="memoryKeys"
								:step="action"
							/>
						</tbody>
					</table>
					<button @click="addPromptQuestion(index)">Add question</button>
				</div>

				<div class="answer">
					<strong>Answer:</strong>
					<div class="answer-details">
						<div>
							<label>Type:
								<select name="promptType" v-model="action.prompt.type" required>
									<option v-for="(promptTypeName, promptTypeKey) in promptTypes" :value="promptTypeKey">{{promptTypeName}}</option>
								</select>
							</label>
						</div>

						<span v-if="action.prompt.type === 'open'">
							<!-- nothing further options -->
						</span>
						<div v-else-if="action.prompt.type === 'open-selection' || action.prompt.type === 'strict-selection'">
							<table>
								<thead>
									<tr> <th>Quick reply</th> <th>Action</th> <th></th></tr>
								</thead>

								<tbody>
									<Selection v-for="(selection, index) in action.prompt.selections" :key="index" :index="index" :selections="action.prompt.selections" :selection="selection" :flows="flows"/>
								</tbody>
							</table>
							<button @click="addSelection(index)">Add quick reply</button>
						</div>

						<div class="retry-message">
							Retry message:
							<input type="text" v-model="action.prompt.retryMessage" size="80" :placeholder="defaultRetryMessage"/>
						</div>

						<div>
							<h3>Memory</h3>

							<FlowStepMemory
								:validateMemory="validateMemory"
								:addMemory="addMemory"
								:removeMemory="removeMemory"
								:memorySetInput="memorySetInput"
								:memorySetValue="memorySetValue"
								:memorySetReference="memorySetReference"
								:memoryUnsetValue="memoryUnsetValue"
								:updateMemoryKey="updateMemoryKey"
								:validation="validation"
								:transformTypes="transformTypes"
								:index="index"
								:memory="action.prompt.memory"
								:selections="action.prompt.selections"
								:memoryKeys="memoryKeys"
								:isPromptMemory="true"
							/>
						</div>

					</div>
				</div>
			</div>

			<div v-else-if="action.type === 'execute-hook'">
				<strong>Hook name:</strong> <input class="hook-name" v-model="action.hook.name" /> <em>(must be exact, case sensitive)</em>
			</div>

			<div v-else-if="action.type === 'update-memory'">
				<FlowStepMemory
					:validateMemory="validateMemory"
					:addMemory="addMemory"
					:removeMemory="removeMemory"
					:memorySetInput="memorySetInput"
					:memorySetValue="memorySetValue"
					:memorySetReference="memorySetReference"
					:memoryUnsetValue="memoryUnsetValue"
					:updateMemoryKey="updateMemoryKey"
					:validation="validation"
					:transformTypes="transformTypes"
					:index="index"
					:memory="action.memory"
					:memoryKeys="memoryKeys"
					:isPromptMemory="false"
				/>
			</div>

			<div v-else>
				Error: unhandled action type "{{action.type}}"
			</div>

		</div>
		<div class="actions">
			<button @click="moveUp(index)" :disabled="index === 0">Move up</button>
			<button @click="moveDown(index)" :disabled="index === (flow.actions.length - 1)">Move down</button>
			<button @click="removeFlowAction(index)">Delete</button>
		</div>

	</li>

</template>


<script>
	import { getSocket } from '../../../scripts/webSocketClient';
	import PromptQuestion from './PromptQuestion';
	import Selection from './Selection';
	import FlowStepMemory from './FlowStepMemory';
	import Vue from 'vue';

	export default {
		props: [ `action`, `flows`, `flow`, `index`, `memoryKeys` ],
		data: function () {
			return {
				validation: {},
				types: {
					message: `Message`,
					media: `Media`,
					prompt: `Prompt`,
					load: `Load Flow`,
					'execute-hook': `Execute hook`,
					'update-memory': `Update memory`,
				},
				transformTypes: {
					preserve: `None`,
					boolean: `Boolean (true/false)`,
					time: `Time (converts to 24 hour clock)`,
					integer: `Integer (whole number)`,
					float: `Float (decimal number)`,
					lowercase: `Lowercase`,
					uppercase: `Uppercase`,
				},
				promptTypes: {
					open: `Open`,
					'open-selection': `Open Selection`,
					'strict-selection': `Strict Selection`,
				},
				conditionalOperators: {
					set: `has been set`,
					'not-set': `has not been set`,
					contains: `contains text: `,
					equals: `is: `,
					'not-equals': `is not: `,
					'starts-with': `starts with: `,
					'ends-with': `ends with: `,
				},
				defaultRetryMessage: `Sorry {{firstName}}, I didn't understand...`, // TODO from database
			};
		},
		components: { PromptQuestion, Selection, FlowStepMemory },
		methods: {
			showConditionalValueField (action) {
				return action.conditional.matchType === `memory-key` && [ `not-equals`, `equals`, `contains`, `starts-with`, `ends-with` ].includes(action.conditional.operator);
			},
			removeFlowAction (index) {
				this.flow.actions.splice(index, 1);
			},
			changeActionType () {
				switch (this.action.type) {
					case `message`:
						break;
					case `media`:
						Vue.set(this.action, `media`, this.action.media || {});
						break;
					case `prompt`:
						Vue.set(this.action, `prompt`, this.action.prompt || {});
						Vue.set(this.action.prompt, `type`, this.action.prompt.type || `open`);
						Vue.set(this.action.prompt, `selections`, this.action.prompt.selections || []);
						Vue.set(this.action.prompt, `text`, this.action.prompt.text ||
							[{ conditional: ``, value: this.action.message }]);
						break;
					case `load`:
						Vue.set(this.action, `load`, this.action.load || {});
						Vue.set(this.action.load, `returnAfter`,
							(typeof this.action.load.returnAfter === `undefined` ? true : this.action.load.returnAfter));
						break;
					case `execute-hook`:
						Vue.set(this.action, `hook`, this.action.hook || {});
						Vue.set(this.action.hook, `name`, this.action.hook.name || ``);
						break;
					case `update-memory`:
						Vue.set(this.action, `memory`, this.action.memory || {});
						break;
					default:
						throw new Error(`Action type ${this.action.type} not handled`);
				}
			},
			toggleConditional () {
				if (this.action.conditional && this.action.conditional.operator) {
					// remove conditional
					Vue.delete(this.action, `conditional`);
				}
				else {
					// add conditional
					Vue.set(this.action, `conditional`, { matchType: `memory-key`, memoryKey: ``, operator: `set`, value: `` });
				}
			},
			validate (eventOrElement) {
				const inputEl = event.target || eventOrElement;
				const field = inputEl.dataset.field;
				if (!inputEl.validity.valid) {
					Vue.set(this.validation, field, inputEl.title);
				}
				else {
					Vue.delete(this.validation, field);
				}
			},
			validateMemory (memoryIndex, eventOrElement) {
				const inputEl = event.target || eventOrElement;
				const field = inputEl.dataset.field;
				Vue.set(this.validation, `memory`, {});
				if (!inputEl.validity.valid) {
					Vue.set(this.validation.memory, `i${memoryIndex}`, inputEl.title);
				}
				else {
					Vue.delete(this.validation.memory, `i${memoryIndex}`);
				}
			},
			addPromptQuestion (index) {
				const flowAction = this.flow.actions[index];
				flowAction.prompt.text = flowAction.prompt.text || [];
				flowAction.prompt.text.push({
					conditional: ``,
					value: ``,
				});
			},
			addSelection (index) {
				const flowAction = this.flow.actions[index];
				flowAction.prompt.selections.push({
					label: `Yes`,
					action: {
						type: `continue`,
					},
				});
			},

			addMemory (index, isPromptMemory = false) {

				const flowAction = this.flow.actions[index];
				const memoryKey = `renameThisKey!`;
				const memoryData = {
					operation: `set`,
					regexp: `(.+)`,
					transform: `preserve`,
					reference: ``,
				};

				if (isPromptMemory) {
					if (typeof flowAction.prompt.memory === `undefined`) {
						Vue.set(flowAction.prompt, `memory`, {});
					}

					Vue.set(flowAction.prompt.memory, memoryKey, memoryData);
				}

				else {
					if (typeof flowAction.memory === `undefined`) {
						Vue.set(flowAction, `memory`, {});
					}

					Vue.set(flowAction.memory, memoryKey, memoryData);
				}

			},

			removeMemory (memoryKey, index, isPromptMemory = false) {

				const flowAction = this.flow.actions[index];

				if (isPromptMemory) {
					Vue.delete(flowAction.prompt.memory, memoryKey);
				}

				else {
					Vue.delete(flowAction.memory, memoryKey);
				}

			},

			memorySetInput (memoryProperties, isPromptMemory = false) {

				Vue.set(memoryProperties, `operation`, `set`);

				Vue.delete(memoryProperties, `value`);
				Vue.delete(memoryProperties, `reference`);
				Vue.set(memoryProperties, `regexp`, `(.+)`);

			},

			memorySetValue (memoryProperties, isPromptMemory = false) {

				Vue.set(memoryProperties, `operation`, `set`);

				Vue.delete(memoryProperties, `regexp`);
				Vue.delete(memoryProperties, `reference`);
				Vue.set(memoryProperties, `value`, `true`);

			},

			memorySetReference (memoryProperties, isPromptMemory = false) {

				Vue.set(memoryProperties, `operation`, `set`);

				Vue.delete(memoryProperties, `regexp`);
				Vue.delete(memoryProperties, `value`);
				Vue.set(memoryProperties, `reference`, ``);

			},

			memoryUnsetValue (memoryProperties, isPromptMemory = false) {

				Vue.set(memoryProperties, `operation`, `unset`);

				Vue.delete(memoryProperties, `regexp`);
				Vue.delete(memoryProperties, `value`);
				Vue.delete(memoryProperties, `reference`);

			},

			updateMemoryKey (memoryProperties, newMemoryKey, event, isPromptMemory = false) {

				const oldMemoryKey = event.target.dataset.oldKey;

				if (isPromptMemory) {
					// Vue data binding does not work for objects: add new key and remove old one.
					Vue.set(this.action.prompt.memory, newMemoryKey, memoryProperties);
					Vue.delete(this.action.prompt.memory, oldMemoryKey);
				}

				else {
					// Vue data binding does not work for objects: add new key and remove old one.
					Vue.set(this.action.memory, newMemoryKey, memoryProperties);
					Vue.delete(this.action.memory, oldMemoryKey);
				}

			},

			insertMemoryTemplate (action, memoryKey, index) {
				const templateToAppend = `{{{${memoryKey}}}}`;
				switch (action.type) {
					case `message`:
						if (typeof action.message === `undefined`) { Vue.set(action, `message`, templateToAppend); }
						else { action.message += templateToAppend; }
						break;
					case `prompt`:
						action.prompt.text[index].value = (action.prompt.text[index].value || ``) + templateToAppend;
						break;
					default: alert(`Cannot insert key into action of type ${action.type}`);
				}
			},
			moveUp (index) {
				const actionToMove = this.flow.actions[index];
				// remove
				this.flow.actions.splice(index, 1);
				// re-insert in higher position
				this.flow.actions.splice(index - 1, 0, actionToMove);
			},
			moveDown (index) {
				const actionToMove = this.flow.actions[index];
				// remove
				this.flow.actions.splice(index, 1);
				// re-insert in lower position
				this.flow.actions.splice(index + 1, 0, actionToMove);
			},
			uploadMedia (event, index) {
				const action = this.flow.actions[index];
				const file = document.getElementById(`file-upload-${action.shortId}`).files[0];

				if (!file) {
					alert(`Please select a file to upload`);
					return;
				}
				else if (file.size > (1024 * 1024 * 2) && file.type.includes(`image`)) { // 2 MB
					if (!confirm(`Your image is ${Math.round(10 * file.size / (1024 * 1024)) / 10}MB, are you sure you want to upload such a large image?`)) {
						return;
					}
				}
				else if (file.size > (1024 * 1024 * 50)) {
					if (!confirm(`Your file is ${Math.round(10 * file.size / (1024 * 1024)) / 10}MB, are you sure you want to upload such a large file?`)) {
						return;
					}
				}
				// all checks passed, continue to upload
				event.target.disabled = true;

				// send to server via web socket
				getSocket().emit(`flows/upload-image`,
					{ name: file.name, type: file.type, filedata: file },
					resData => {
						Vue.set(action.media, `type`, file.type);
						Vue.set(action.media, `filename`, file.name);
						Vue.set(action.media, `url`, resData.url);
					});
			},
			deleteMedia (index) {
				const action = this.flow.actions[index];
				getSocket().emit(`flows/delete-image`,
					{ url: action.media.url },
					resData => {
						Vue.delete(action.media, `type`);
						Vue.delete(action.media, `filename`);
						Vue.delete(action.media, `url`);
					});
			},
		},
	};

</script>

<style lang="scss" scoped>

	.flow-step {
		margin: 2.00rem 0;

		>input[type="text"] {
			line-height: 2rem;
			padding-left: 1rem;
			padding-right: 1rem;
		}

		>.actions {
			margin-top: 1.00rem;
			text-align: right;
		}
	}

	input:invalid, select:invalid, textarea:invalid {
		border: 2px solid red;
	}

	input.hook-name {
		width: 15.00rem;
	}

	.uid {
		padding: 0.5em;
		background-color: #eef;
		border-radius: 1rem;
		margin: 0.5em;
		display: inline-block;
		text-decoration: none;
		color: #000;
	}

	.step-type-specifics {
		margin: 1rem;
		margin-left: 2rem;
		padding: 1rem;
		background-color: #eee;
		border-radius: 0.5rem;
	}

	.message, .question textarea {
		width: 100%;
	}

	select {
		max-width: 20rem;
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
		padding: 0rem;

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

	.inline-help {
		font-size: 0.8rem;
		color: #888;
	}

	.inline-error {
		font-size: 0.8rem;
		color: #f33;
	}

	.memory-keys {
		li {
			padding: 0.2rem;
			&:hover {
				background-color: #333;
				color: #fff;
				border-radius: 0.5rem;
				cursor: pointer;
			}
			&:hover::after {
				content: "  click to insert";
				color: #cfc;
			}
		}
	}

	.file-upload {
		background-color: #fff;
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.media-preview {
		max-width: 100%;
		max-height: 500px;
	}

	.conditional {
		background-color: #eee;
		border-radius: 0.5rem;
		padding: 1rem;
		margin: 1rem;
		display: inline-block;
	}
	button:disabled .spinner {
		display: inline-block !important;
	}
	.spinner {
		display: none;
	  margin: 0 auto 0;
	  width: 1.5rem;
	  text-align: center;
		> div {
		  width: 0.3rem;
		  height: 0.3rem;
		  background-color: #333;

		  border-radius: 100%;
		  display: inline-block;
		  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
		  animation: sk-bouncedelay 1.4s infinite ease-in-out both;

			&.bounce1 {
			  -webkit-animation-delay: -0.32s;
			  animation-delay: -0.32s;
			}
			&.bounce2 {
			  -webkit-animation-delay: -0.16s;
			  animation-delay: -0.16s;
			}
		}
	}

@-webkit-keyframes sk-bouncedelay {
  0%, 80%, 100% { -webkit-transform: scale(0) }
  40% { -webkit-transform: scale(1.0) }
}

@keyframes sk-bouncedelay {
  0%, 80%, 100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  } 40% {
    -webkit-transform: scale(1.0);
    transform: scale(1.0);
  }
}


</style>
