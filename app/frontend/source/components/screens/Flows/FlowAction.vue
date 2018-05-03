<!--
	FLOWSTEP
-->

<template>

	<li class="flow-action">
		<div :id="action.shortId"><a :href="`#${action.shortId}`" class="uid">#{{action.shortId}}</a></div>

		<div><label>Type: <select name="type" v-model="action.uiMeta.stepType" @change="changeActionType()" required>
			<option v-for="(typeName, typeKey) in types" :key="typeKey" :value="typeKey">{{typeName}}</option>
		</select></label></div>

		<div class="conditional">
			<label><input type="checkbox" :checked="action.uiMeta.conditional && action.uiMeta.conditional.operator" @change="toggleConditional()"/> Conditional </label>
			<div v-if="action.uiMeta.conditional && action.uiMeta.conditional.operator">
				<label>
					Only run this action if
					<select :name="action.shortId + `_conditionalMatchType`" v-model="action.uiMeta.conditional.matchType" required>
						<option value="memory-key">memory key:</option>
						<option value="expression">expression is true:</option>
					</select>
					<input :name="action.shortId + `_conditionalMemoryKey`" v-model="action.uiMeta.conditional.memoryKey" size="30" type="text" :required="action.uiMeta.conditional.matchType === `memory-key`" v-show="action.uiMeta.conditional.matchType === `memory-key`" pattern="[A-Za-z0-9_/]+" list="memoryKeys" data-field="conditionalMemoryKey" @input="validate" title="Required - alphanumeric characters and underscores only" />
					<input :name="action.shortId + `_conditionalExpression`" v-model="action.uiMeta.conditional.expression" size="70" type="text" :required="action.uiMeta.conditional.matchType === `expression`" v-show="action.uiMeta.conditional.matchType === `expression`" pattern=".+" @input="validate" />
					<p class="inline-error" v-if="validation.conditionalMemoryKey">{{validation.conditionalMemoryKey}}</p>
				</label>
				<select :name="action.shortId + `_conditionalOperator`" v-model="action.uiMeta.conditional.operator" :required="action.uiMeta.conditional.matchType === `memory-key`" v-show="action.uiMeta.conditional.matchType === `memory-key`">
					<option v-for="(operatorString, operatorKey) in conditionalOperators" :value="operatorKey">{{operatorString}}</option>
				</select>
				<input :name="action.shortId + `_conditionalValue`" type="text" v-model="action.uiMeta.conditional.value" :required="showConditionalValueField(action)" v-show="showConditionalValueField(action)"/>
			</div>
		</div>

		<div class="action-type-specifics">

			<div v-if="action.uiMeta.stepType === 'send-message'">
				<textarea class="message" v-model="action.message.text" required></textarea>
				<details class="inline-help">
					<summary>Available memory keys</summary>
					<ul class="memory-keys">
						<li v-for="memoryKey in memoryKeys" @click="insertMemoryTemplate(action, memoryKey)"><code>{{memoryKey}}</code></li>
					</ul>
				</details>
			</div>

			<div v-else-if="action.uiMeta.stepType === 'media'">
				<div class="file-upload" v-if="!action.message.attachments[0].remoteUrl">
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

				<div><label>Media URL: <input type="url" v-model="action.message.attachments[0].remoteUrl" size="50"/></label></div>
				<div>
					<label>Filename: <input type="text" v-model="action.message.attachments[0].filename"/></label>
					<span class="inline-help">It is best to include a file extension as it may help determine the file type.</span>
				</div>
				<div><label>Type:
					<select v-model="action.message.attachments[0].type">
						<option value=""></option>
						<option value="image">Image</option>
						<option value="audio">Audio</option>
						<option value="video">Video</option>
						<option value="file">File</option>
					</select></label>
				</div>
				<div><label>MIME Type: <input type="text" v-model="action.message.attachments[0].mimeType" list="commonMimeTypes"/></label>
					<span class="inline-help">This may help determine the type of file being sent.</span>
				</div>
				<img class="media-preview" v-if="action.message.attachments[0].remoteUrl && action.message.attachments[0].mimeType && action.message.attachments[0].mimeType.includes(`image`)" :src="action.message.attachments[0].remoteUrl"/>
			</div>

			<div v-else-if="action.uiMeta.stepType === 'change-flow'">
				<label>
					<strong>Flow:</strong>
					<select v-model="action.nextUri" required>
						<option v-for="(flowToLoad, flowId) in flows" v-if="flowToLoad.uri" :value="flowToLoad.uri">{{flowToLoad.uri}} - {{flowToLoad.name}}</option>
					</select>
				</label>
				<!--<select v-if="action.load._flow" v-model="action.load.step">
					<option v-for="actionToLoad in flows[action.load._flow].actions" :value="actionToLoad.shortId">#{{actionToLoad.shortId}} - {{actionToLoad.message || actionToLoad.prompt.text || actionToLoad.media.filename}}</option>
				</select>
				<br />
				<br />
				<label>
					<input type="checkbox" v-model="action.load.returnAfter" :checked="action.load.returnAfter" />
					Return here after the loaded flow has finished.
				</label>-->
			</div>

			<div v-else-if="action.uiMeta.stepType === 'execute-hook'">
				<strong>Hook name:</strong> <input class="hook-name" v-model="action.hook" /> <em>(must be exact, case sensitive)</em>
			</div>

			<div v-else-if="action.uiMeta.stepType === 'update-memory'">
				<FlowMemory
					:validation="validation"
					:memory="action.memory"
					:memoryParent="action"
					:memoryKeys="memoryKeys"
					:isPromptMemory="false"
				/>
			</div>

			<div v-else>
				Error: unhandled action type "{{action.uiMeta.stepType}}"
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
	import Vue from 'vue';
	import ValidationMixin from './validationMixin';
	import FlowMemory from './FlowMemory';

	export default {
		props: [ `action`, `flows`, `flow`, `index`, `memoryKeys` ],
		data: function () {
			return {
				types: {
					'send-message': `Message`,
					media: `Media`,
					prompt: `Prompt`,
					'change-flow': `Change Flow`,
					'execute-hook': `Execute hook`,
					'update-memory': `Update memory`,
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
			};
		},
		components: { FlowMemory },
		mixins: [ ValidationMixin ],
		methods: {
			showConditionalValueField (action) {
				return action.uiMeta.conditional.matchType === `memory-key` &&
					[ `not-equals`, `equals`, `contains`, `starts-with`, `ends-with` ].includes(action.uiMeta.conditional.operator);
			},
			removeFlowAction (index) {
				this.flow.actions.splice(index, 1);
			},
			changeActionType () {
				Vue.set(this.action, `type`, this.action.uiMeta.stepType);
				switch (this.action.uiMeta.stepType) {
					case `send-message`:
						Vue.set(this.action, `message`, this.action.message || {});
						Vue.set(this.action.message, `text`, this.action.message.text || ``);
						Vue.delete(this.action.message, `attachments`);
						break;
					case `media`:
						// there is no `media` type in the Hippocamp model, it's just a variation on `send-message`
						Vue.set(this.action, `type`, `send-message`);
						Vue.set(this.action, `message`, this.action.message || {});
						Vue.delete(this.action.message, `text`);
						Vue.set(this.action.message, `attachments`, this.action.message.attachments || [ {} ]);
						break;
					case `change-flow`:
						// Vue.set(this.action, `load`, this.action.load || {});
						// Vue.set(this.action.load, `returnAfter`,
						// 	(typeof this.action.load.returnAfter === `undefined` ? true : this.action.load.returnAfter));
						break;
					case `execute-hook`:
						break;
					case `update-memory`:
						Vue.set(this.action, `memory`, this.action.memory || {});
						break;
					default:
						throw new Error(`Action type ${this.action.uiMeta.stepType} not handled`);
				}
			},
			toggleConditional () {
				if (this.action.uiMeta.conditional && this.action.uiMeta.conditional.operator) {
					// remove conditional
					Vue.delete(this.action.uiMeta, `conditional`);
				}
				else {
					// add conditional
					Vue.set(this.action, `uiMeta`, this.action.uiMeta || {});
					Vue.set(this.action.uiMeta, `conditional`,
						{ matchType: `memory-key`, memoryKey: ``, operator: `set`, value: `` });
				}
			},

			insertMemoryTemplate (action, memoryKey) {
				const templateToAppend = `{{{${memoryKey}}}}`;
				switch (action.type) {
					case `send-message`:
						if (typeof action.message === `undefined`) { Vue.set(action, `message`, templateToAppend); }
						else { action.message += templateToAppend; }
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
			mapMimeToAttachmentType (mimeType) {
				if (mimeType.includes(`image`)) {
					return `image`;
				}
				else if (mimeType.includes(`audio`)) {
					return `audio`;
				}
				else if (mimeType.includes(`video`)) {
					return `video`;
				}
				else {
					return `file`;
				}
			},
			uploadMedia (event, index) {
				const action = this.flow.actions[index];
				const file = document.getElementById(`file-upload-${action.shortId}`).files[0];

				if (!file) {
					alert(`Please select a file to upload`);
					return;
				}
				else if (file.size > (1024 * 1024 * 2) && file.type.includes(`image`)) { // 2 MB
					if (!confirm(`Your image is ${Math.round(10 * file.size / (1024 * 1024)) / 10}MB,` +
						` are you sure you want to upload such a large image?`)) {
						return;
					}
				}
				else if (file.size > (1024 * 1024 * 50)) {
					if (!confirm(`Your file is ${Math.round(10 * file.size / (1024 * 1024)) / 10}MB, ` +
						`are you sure you want to upload such a large file?`)) {
						return;
					}
				}
				// all checks passed, continue to upload
				event.target.disabled = true;

				// send to server via web socket
				getSocket().emit(`flows/upload-image`,
					{ name: file.name, type: file.type, filedata: file },
					resData => {
						Vue.set(action.message.attachments[0], `type`, this.mapMimeToAttachmentType(file.type));
						Vue.set(action.message.attachments[0], `mimeType`, file.type);
						Vue.set(action.message.attachments[0], `filename`, file.name);
						Vue.set(action.message.attachments[0], `remoteUrl`, resData.url);
					});
			},
			deleteMedia (index) {
				const action = this.flow.actions[index];
				getSocket().emit(`flows/delete-image`,
					{ url: action.message.attachments[0].remoteUrl },
					resData => {
						Vue.delete(action.message.attachments[0], `mimeType`);
						Vue.delete(action.message.attachments[0], `filename`);
						Vue.delete(action.message.attachments[0], `remoteUrl`);
					});
			},
		},
	};

</script>

<style lang="scss" scoped>

	.flow-action {
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

	.action-type-specifics {
		margin: 1rem;
		margin-left: 2rem;
		padding: 1rem;
		background-color: #eee;
		border-radius: 0.5rem;
	}

	.message {
		width: 100%;
	}

	select {
		max-width: 20rem;
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
