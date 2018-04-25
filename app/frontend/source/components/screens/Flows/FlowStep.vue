<!--
	FLOWSTEP
-->

<template>

	<li class="flow-step">
		<div :id="step.shortId"><a :href="`#${step.shortId}`" class="uid">#{{step.shortId}}</a></div>

		<div><label>Type: <select name="stepType" v-model="step.stepType" @change="changeStepType()" required>
			<option v-for="(stepTypeName, stepTypeKey) in stepTypes" :key="stepTypeKey" :value="stepTypeKey">{{stepTypeName}}</option>
		</select></label></div>

		<div class="conditional">
			<label><input type="checkbox" :checked="step.conditional && step.conditional.operator" @change="toggleConditional()"/> Conditional </label>
			<div v-if="step.conditional && step.conditional.operator">
				<label>
					Only run this step if
					<select :name="step.shortId + `_conditionalMatchType`" v-model="step.conditional.matchType" required>
						<option value="memory-key">memory key:</option>
						<option value="expression">expression is true:</option>
					</select>
					<input :name="step.shortId + `_conditionalMemoryKey`" v-model="step.conditional.memoryKey" size="30" type="text" :required="step.conditional.matchType === `memory-key`" v-show="step.conditional.matchType === `memory-key`" pattern="[A-Za-z0-9_/]+" list="memoryKeys" data-field="loopSplitKey" @input="validate" title="Required - alphanumeric characters and underscores only" />
					<input :name="step.shortId + `_conditionalExpression`" v-model="step.conditional.expression" size="70" type="text" :required="step.conditional.matchType === `expression`" v-show="step.conditional.matchType === `expression`" pattern=".+" @input="validate" />
					<p class="inline-error" v-if="validation.loopSplitKey">{{validation.conditional}}</p>
				</label>
				<select :name="step.shortId + `_conditionalOperator`" v-model="step.conditional.operator" :required="step.conditional.matchType === `memory-key`" v-show="step.conditional.matchType === `memory-key`">
					<option v-for="(operatorString, operatorKey) in conditionalOperators" :value="operatorKey">{{operatorString}}</option>
				</select>
				<input :name="step.shortId + `_conditionalValue`" type="text" v-model="step.conditional.value" :required="showConditionalValueField(step)" v-show="showConditionalValueField(step)"/>
			</div>
		</div>

		<div class="loop">
			<label><input type="checkbox" :checked="step.loop" @change="toggleLoop()"/> Loop </label>
			<div v-if="step.loop">
				<div><label>Memory key to split (by comma): <input v-model="step.loop.splitMemoryKey" required size="30" type="text" pattern="[A-Za-z0-9_/]+" list="memoryKeys" data-field="loopSplitKey" @input="validate" title="Required - alphanumeric characters and underscores only" /> </label></div>
				<p class="inline-error" v-if="validation.loopSplitKey">{{validation.loopSplitKey}}</p>
				<div><label>Memory key to use in the loop: <input v-model="step.loop.iterationMemoryKey" required size="30" type="text" pattern="[A-Za-z0-9_/]+" list="memoryKeys" data-field="loopItemKey" @input="validate" title="Required - alphanumeric characters and underscores only"/> </label></div>
				<p class="inline-error" v-if="validation.loopItemKey">{{validation.loopItemKey}}</p>
			</div>
		</div>

		<div class="step-type-specifics">

			<div v-if="step.stepType === 'message'">
				<textarea class="message" v-model="step.message" required/></textarea>
				<details class="inline-help">
					<summary>Available memory keys</summary>
					<ul class="memory-keys">
						<li v-for="memoryKey in memoryKeys" @click="insertMemoryTemplate(step, memoryKey)"><code>{{memoryKey}}</code></li>
					</ul>
				</details>
			</div>

			<div v-else-if="step.stepType === 'media'">
				<div class="file-upload" v-if="!step.media.url">
					<label>Upload a media file: <input type="file" :id="`file-upload-${step.shortId}`"/></label>
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

				<div><label>Media URL: <input type="url" v-model="step.media.url" size="50"/></label></div>
				<div>
					<label>Filename: <input type="text" v-model="step.media.filename"/></label>
					<span class="inline-help">It is best to include a file extension as it may help determine the file type.</span>
				</div>
				<div><label>MIME Type: <input type="text" v-model="step.media.type" list="commonMimeTypes"/></label>
					<span class="inline-help">This may help determine the type of file being sent.</span>
				</div>
				<img class="media-preview" v-if="step.media.url && step.media.type.includes(`image`)" :src="step.media.url"/>
			</div>

			<div v-else-if="step.stepType === 'schedule-flow'">
				<div><label>ID (optional): <input v-model="step.schedule.taskId" size="20" placeholder=""/></label></div>
				<div>
					<label>Run:
						<select v-model="step.schedule.maxRuns" required>
							<option value="0">Continuously</option>
							<option value="1">Once</option>
						</select>
					</label>
				</div>
				<div><label>Time interval:
					<input v-model="step.schedule.runEvery" size="15" placeholder="1 day" required data-field="scheduleRunEvery" @input="validate" title="Required"/></label></div>
					<p class="inline-error" v-if="validation.scheduleRunEvery">{{validation.scheduleRunEvery}}</p>
				<div><label>Run at time: <input v-model="step.schedule.runTime" size="40" placeholder="'07:30' or '<user_given_time>'"/></label></div>
				<div>Ignore days: <label v-for="(isoDay, dayName) in days" :key="dayName">
					<input type="checkbox"
					 @change="toggleIgnoreDay(isoDay)"
					 :checked="step.schedule.ignoreDays && step.schedule.ignoreDays.includes(isoDay)"
					 :value="isoDay" /> {{dayName}} </label>
				 </div>
				<div><label>Flow to schedule: <select v-model="step.schedule._flow" required>
					<option v-for="(flowToLoad, flowId) in flows" :value="flowId">{{flowToLoad.name}}</option>
				</select></label></div>
			</div>

			<div v-else-if="step.stepType === 'load'">
				<label>
					<strong>Flow:</strong>
					<select v-model="step.load._flow" required>
						<option v-for="(flowToLoad, flowId) in flows" :value="flowId">{{flowToLoad.name}}</option>
					</select>
				</label>
				<select v-if="step.load._flow" v-model="step.load.step">
					<option v-for="stepToLoad in flows[step.load._flow].steps" :value="stepToLoad.shortId">#{{stepToLoad.shortId}} - {{stepToLoad.message || stepToLoad.prompt.text || stepToLoad.media.filename}}</option>
				</select>
				<br />
				<br />
				<label>
					<input type="checkbox" v-model="step.load.returnAfter" :checked="step.load.returnAfter" />
					Return here after the loaded flow has finished.
				</label>
			</div>

			<div v-else-if="step.stepType === 'prompt'">
				<div class="questions">
					<strong>Questions:</strong>
					<table>
						<tbody>
							<PromptQuestion
								v-for="(promptQuestion, index) in step.prompt.text"
								:key="index"
								:promptQuestion="promptQuestion"
								:index="index"
								:promptQuestions="step.prompt.text"
								:insertMemoryTemplate="insertMemoryTemplate"
								:memoryKeys="memoryKeys"
								:step="step"
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
								<select name="promptType" v-model="step.prompt.type" required>
									<option v-for="(promptTypeName, promptTypeKey) in promptTypes" :value="promptTypeKey">{{promptTypeName}}</option>
								</select>
							</label>
						</div>

						<span v-if="step.prompt.type === 'open'">
							<!-- nothing further options -->
						</span>
						<div v-else-if="step.prompt.type === 'open-selection' || step.prompt.type === 'strict-selection'">
							<table>
								<thead>
									<tr> <th>Quick reply</th> <th>Action</th> <th></th></tr>
								</thead>

								<tbody>
									<Selection v-for="(selection, index) in step.prompt.selections" :key="index" :index="index" :selections="step.prompt.selections" :selection="selection" :flows="flows"/>
								</tbody>
							</table>
							<button @click="addSelection(index)">Add quick reply</button>
						</div>

						<div class="retry-message">
							Retry message:
							<input type="text" v-model="step.prompt.retryMessage" size="80" :placeholder="defaultRetryMessage"/>
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
								:memory="step.prompt.memory"
								:selections="step.prompt.selections"
								:memoryKeys="memoryKeys"
								:isPromptMemory="true"
							/>
						</div>

					</div>
				</div>
			</div>

			<div v-else-if="step.stepType === 'quote'">
				<div>
					<select v-model="step.quote.quoteSets" multiple required>
						<option v-for="quoteSet in quoteSets" :key="quoteSet._id" :value="quoteSet._id">{{quoteSet.name}}</option>
					</select>
				</div>
				<p class="inline-help">An item from the selected collections will be randomly selected and sent to the user.</p>
				<div><label>Template (optional):
					<input type="text" v-model="step.quote.template" placeholder="<quote>" size="50"
						title="Please include '<quote>' in the template where the quote will be inserted" pattern=".*<quote>.*" data-field="quote" @input="validate"/>
					</label>
					<p class="inline-error" v-if="validation.quote">{{validation.quote}}</p>
				</div>
			</div>

			<div v-else-if="step.stepType === 'notify-admin'">
				<p class="inline-help">An email will be sent to the admin(s), with details of the time and user, plus the following message:</p>
				<div><label>Template (optional): <br/><textarea type="text" v-model="step.notification.template"></textarea></label></div>
				<details class="inline-help">
					<summary>Available memory keys</summary>
					<ul class="memory-keys">
						<li v-for="memoryKey in memoryKeys" @click="insertMemoryTemplate(step, memoryKey)"><code>{{memoryKey}}</code></li>
					</ul>
				</details>
			</div>

			<div v-else-if="step.stepType === 'unschedule'">
				<p>Any previously scheduled flows will be unscheduled for the user.</p>
			</div>

			<div v-else-if="step.stepType === 'execute-hook'">
				<strong>Hook name:</strong> <input class="hook-name" v-model="step.hook.name" /> <em>(must be exact, case sensitive)</em>
			</div>

			<div v-else-if="step.stepType === 'update-memory'">
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
					:memory="step.memory"
					:memoryKeys="memoryKeys"
					:isPromptMemory="false"
				/>
			</div>

			<div v-else>
				Error: unhandled step type "{{step.stepType}}"
			</div>

		</div>
		<div class="actions">
			<button @click="moveUp(index)" :disabled="index === 0">Move up</button>
			<button @click="moveDown(index)" :disabled="index === (flow.steps.length - 1)">Move down</button>
			<button @click="removeFlowStep(index)">Delete</button>
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
		props: [`step`, `flows`, `flow`, `index`, `memoryKeys`, `quoteSets`],
		data: function () {
			return {
				validation: {},
				stepTypes: {
					message: "Message",
					media: "Media",
					prompt: "Prompt",
					load: "Load Flow",
					'schedule-flow': "Schedule Flow",
					unschedule: "Unschedule All Flows",
					quote: "Quote / hint / tip",
					'notify-admin': "Notify admin",
					'execute-hook': "Execute hook",
					'update-memory': "Update memory",
				},
				days: {
					"Monday" : 1,
					"Tuesday" : 2,
					"Wednesday" : 3,
					"Thursday" : 4,
					"Friday" : 5,
					"Saturday" : 6,
					"Sunday" : 7,
				},
				transformTypes: {
					preserve: "None",
					boolean: "Boolean (true/false)",
					time: "Time (converts to 24 hour clock)",
					integer: "Integer (whole number)",
					float: "Float (decimal number)",
					lowercase: "Lowercase",
					uppercase: "Uppercase",
				},
				promptTypes: {
					open: "Open",
					'open-selection': "Open Selection",
					'strict-selection': "Strict Selection",
				},
				conditionalOperators: {
					set: "has been set",
					'not-set': "has not been set",
					contains: "contains text: ",
					equals: "is: ",
					'not-equals': "is not: ",
					'starts-with': "starts with: ",
					'ends-with': "ends with: ",
				},
				defaultRetryMessage: "Sorry {{firstName}}, I didn't understand...", // TODO from database
			};
		},
		components: { PromptQuestion, Selection, FlowStepMemory },
		methods: {
			showConditionalValueField (step) {
				return step.conditional.matchType === `memory-key` && [ `not-equals`, `equals`, `contains`, `starts-with`, `ends-with` ].includes(step.conditional.operator);
			},
			removeFlowStep (index) {
				this.flow.steps.splice(index, 1);
			},
			changeStepType () {
				switch (this.step.stepType) {
					case `message`:
						break;
					case `media`:
						Vue.set(this.step, `media`, this.step.media || {});
						break;
					case `prompt`:
						Vue.set(this.step, `prompt`, this.step.prompt || {});
						Vue.set(this.step.prompt, `type`, this.step.prompt.type || `open`);
						Vue.set(this.step.prompt, `selections`, this.step.prompt.selections || []);
						Vue.set(this.step.prompt, `text`, this.step.prompt.text || [{ conditional: ``, value: this.step.message }]);
						break;
					case `load`:
						Vue.set(this.step, `load`, this.step.load || {});
						Vue.set(this.step.load, `returnAfter`, (typeof this.step.load.returnAfter === `undefined` ? true : this.step.load.returnAfter));
						break;
					case `unschedule`:
						break;
					case `schedule-flow`:
						Vue.set(this.step, `schedule`, this.step.schedule || { ignoreDays: [], maxRuns: 0 });
						break;
					case `quote`:
						Vue.set(this.step, `quote`, this.step.quote || {});
						Vue.set(this.step.quote, `quoteSets`, this.step.quote.quoteSets || []);
						break;
					case `notify-admin`:
						Vue.set(this.step, `notification`, this.step.notification || {});
						Vue.set(this.step.notification, `template`, this.step.notification.template || ``);
						break;
					case `execute-hook`:
						Vue.set(this.step, `hook`, this.step.hook || {});
						Vue.set(this.step.hook, `name`, this.step.hook.name || ``);
						break;
					case `update-memory`:
						Vue.set(this.step, `memory`, this.step.memory || {});
						break;
					default:
						throw new Error(`Step type ${this.step.stepType} not handled`);
				}
			},
			toggleConditional () {
				if (this.step.conditional && this.step.conditional.operator) {
					// remove conditional
					Vue.delete(this.step, `conditional`);
				}
				else {
					// add conditional
					Vue.set(this.step, `conditional`, { matchType: `memory-key`, memoryKey: "", operator: "set", value: "" });
				}
			},
			toggleLoop () {
				if (this.step.loop) {
					// remove loop
					Vue.delete(this.step, `loop`);
				}
				else {
					// add loop
					Vue.set(this.step, `loop`, { splitMemoryKey: "", iterationMemoryKey: "loop_item" });
				}
			},
			validate (eventOrElement) {
				const inputEl = event.target || eventOrElement;
				const field = inputEl.dataset.field;
				if (!inputEl.validity.valid) {
					Vue.set(this.validation, field, inputEl.title);
				} else {
					Vue.delete(this.validation, field);
				}
			},
			validateMemory (memoryIndex, eventOrElement) {
				const inputEl = event.target || eventOrElement;
				const field = inputEl.dataset.field;
				Vue.set(this.validation, `memory`, {});
				if (!inputEl.validity.valid) {
					Vue.set(this.validation.memory, `i`+memoryIndex, inputEl.title);
				} else {
					Vue.delete(this.validation.memory, `i`+memoryIndex);
				}
			},
			toggleIgnoreDay (isoDayString) {
				let ignoreDays = this.step.schedule.ignoreDays;
				if (!Array.isArray(ignoreDays)) {
					Vue.set(this.step.schedule, `ignoreDays`, []);
					ignoreDays = this.step.schedule.ignoreDays;
				}
				const isoDay = Number(isoDayString);
				if (ignoreDays.includes(isoDay)) {
					ignoreDays.splice(ignoreDays.indexOf(isoDay), 1); // remove
				}
				else {
					ignoreDays.push(isoDay); // add
				}
			},
			addPromptQuestion (index) {
				const flowStep = this.flow.steps[index];
				flowStep.prompt.text = flowStep.prompt.text || [];
				flowStep.prompt.text.push({
					conditional: ``,
					value: ``,
				});
			},
			addSelection (index) {
				const flowStep = this.flow.steps[index];
				flowStep.prompt.selections.push({
					label: `Yes`,
					action: {
						type: `continue`,
					},
				});
			},

			addMemory (index, isPromptMemory = false) {

				const flowStep = this.flow.steps[index];
				const memoryKey = "renameThisKey!";
				const memoryData = {
					operation: "set",
					regexp: "(.+)",
					transform: "preserve",
					reference: ``,
				};

				if (isPromptMemory) {
					if (typeof flowStep.prompt.memory === `undefined`) {
						Vue.set(flowStep.prompt, `memory`, {});
					}

					Vue.set(flowStep.prompt.memory, memoryKey, memoryData);
				}

				else {
					if (typeof flowStep.memory === `undefined`) {
						Vue.set(flowStep, `memory`, {});
					}

					Vue.set(flowStep.memory, memoryKey, memoryData);
				}

			},

			removeMemory (memoryKey, index, isPromptMemory = false) {

				const flowStep = this.flow.steps[index];

				if (isPromptMemory) {
					Vue.delete(flowStep.prompt.memory, memoryKey);
				}

				else {
					Vue.delete(flowStep.memory, memoryKey);
				}

			},

			memorySetInput (memoryProperties, isPromptMemory = false) {

				Vue.set(memoryProperties, "operation", "set");

				Vue.delete(memoryProperties, "value");
				Vue.delete(memoryProperties, "reference");
				Vue.set(memoryProperties, "regexp", "(.+)");

			},

			memorySetValue (memoryProperties, isPromptMemory = false) {

				Vue.set(memoryProperties, "operation", "set");

				Vue.delete(memoryProperties, "regexp");
				Vue.delete(memoryProperties, "reference");
				Vue.set(memoryProperties, "value", "true");

			},

			memorySetReference (memoryProperties, isPromptMemory = false) {

				Vue.set(memoryProperties, "operation", "set");

				Vue.delete(memoryProperties, "regexp");
				Vue.delete(memoryProperties, "value");
				Vue.set(memoryProperties, "reference", "");

			},

			memoryUnsetValue (memoryProperties, isPromptMemory = false) {

				Vue.set(memoryProperties, "operation", "unset");

				Vue.delete(memoryProperties, "regexp");
				Vue.delete(memoryProperties, "value");
				Vue.delete(memoryProperties, "reference");

			},

			updateMemoryKey (memoryProperties, newMemoryKey, event, isPromptMemory = false) {

				const oldMemoryKey = event.target.dataset.oldKey;

				if (isPromptMemory) {
					// Vue data binding does not work for objects: add new key and remove old one.
					Vue.set(this.step.prompt.memory, newMemoryKey, memoryProperties);
					Vue.delete(this.step.prompt.memory, oldMemoryKey);
				}

				else {
					// Vue data binding does not work for objects: add new key and remove old one.
					Vue.set(this.step.memory, newMemoryKey, memoryProperties);
					Vue.delete(this.step.memory, oldMemoryKey);
				}

			},

			insertMemoryTemplate (step, memoryKey, index) {
				const templateToAppend = `{{{` + memoryKey + `}}}`;
				switch (step.stepType) {
					case 'message':
						if (typeof step.message === `undefined`)
							Vue.set(step, `message`, templateToAppend);
						else
							step.message += templateToAppend;
						break;
					case 'prompt':
						step.prompt.text[index].value = (step.prompt.text[index].value || ``) + templateToAppend;
						break;
					case 'notify-admin':
						if (typeof step.notification.template === `undefined`)
						Vue.set(step.notification, `template`, templateToAppend);
						else
							step.notification.template += templateToAppend;
						break;
					default: alert(`Cannot insert key into step of type ${step.stepType}`);
				}
			},
			moveUp (index) {
				const stepToMove = this.flow.steps[index];
				// remove
				this.flow.steps.splice(index, 1);
				// re-insert in higher position
				this.flow.steps.splice(index-1, 0, stepToMove);
			},
			moveDown (index) {
				const stepToMove = this.flow.steps[index];
				// remove
				this.flow.steps.splice(index, 1);
				// re-insert in lower position
				this.flow.steps.splice(index+1, 0, stepToMove);
			},
			uploadMedia (event, index) {
				const step = this.flow.steps[index];
				const file = document.getElementById(`file-upload-${step.shortId}`).files[0];

				if (!file) {
					alert("Please select a file to upload");
					return;
				}
				else if(file.size > (1024*1024*2) && file.type.includes("image")) { // 2 MB
					if(!confirm(`Your image is ${Math.round(10*file.size/(1024*1024))/10}MB, are you sure you want to upload such a large image?`)) {
						return;
					}
				}
				else if(file.size > (1024*1024*50)) {
					if(!confirm(`Your file is ${Math.round(10*file.size/(1024*1024))/10}MB, are you sure you want to upload such a large file?`)) {
						return;
					}
				}
				// all checks passed, continue to upload
				event.target.disabled = true;

				// send to server via web socket
				getSocket().emit(`flows/upload-image`,
					{ name: file.name, type: file.type, filedata : file },
					resData => {
						Vue.set(step.media, `type`, file.type);
						Vue.set(step.media, `filename`, file.name);
						Vue.set(step.media, `url`, resData.url);
					});
			},
			deleteMedia (index) {
				const step = this.flow.steps[index];
				getSocket().emit('flows/delete-image',
					{ url: step.media.url },
					resData => {
						Vue.delete(step.media, `type`);
						Vue.delete(step.media, `filename`);
						Vue.delete(step.media, `url`);
					});
			}
		}
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

	.conditional, .loop {
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
