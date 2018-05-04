<!--
	FLOW ACTION MEMORY
-->

<template>

	<div>
		<p v-if="memory && memory.length === 0">None</p>
		<dl v-else v-model="memory">
			<template v-for="(memoryProperties, memoryKey, memoryIndex) in memory">
				<dt>
					Key: <input :data-old-key="memoryKey" v-model.lazy="memoryKey" ref="memoryKeys" @change="updateMemoryKey(memoryProperties, memoryKey, $event, memoryParent)" required
					 @input="validateMemory(memoryIndex, $event)" title="Required - alphanumeric characters and underscores only" size="30" type="text" pattern="[A-Za-z0-9_/]+" list="memoryKeys"/>
					<button @click="removeMemory(memoryKey, memory)" class="mini">Remove</button>
					<p class="inline-error" v-if="validation.memory && validation.memory[`i`+memoryIndex]">{{validation.memory[`i`+memoryIndex]}}</p>
				</dt>
				<dd>
					<div><label>Transform: <select v-model="memoryProperties.transform" required>
						<option v-for="(transformTypeName, transformTypeKey) in transformTypes" :value="transformTypeKey">{{transformTypeName}}</option>
				</select></label></div>

					<div><label><input type="radio" @click="memorySetInput(memoryProperties)" :checked="memoryProperties.operation === `set` && memoryProperties.regexp != null"/> Save user input </label></div>
					<div v-show="memoryProperties.regexp != null" class="memory-details">
						<div>
							<label> Simple match:
								<select v-model="memoryProperties.regexp">
									<option value="" disabled></option>
									<option value="(.+)">Anything</option>
									<option value="(\w+)">Single word</option>
									<option value="([1-9][0-9]? ((hours)|(hour)|(days)|(day)|(weeks)|(week)|(months)|(month)|(minutes)|(minute)))">Time period (eg. "2 days")</option>
									<!-- <option value="([0-2][0-9]:[0-5][0-9])">Military time (eg. "07:00")</option> -->
									<option v-for="option in options" :value="`(${option.label})`">Reply: {{option.label}}</option>
								</select>
							</label>
						</div>
						<div><label>Regular expression: <input type="text" pattern=".*" v-model="memoryProperties.regexp"/></label></div>
						<p class="inline-help">The <em>regular expression</em> is automatically set based on the <em>simple match</em> above, you only need to manually override this if you need more complex matching.</p>
						<div><label><input v-model="memoryProperties.required" type="checkbox"/> ask user to try again if not matched </label></div>
					</div>

					<div><label><input type="radio" @click="memorySetValue(memoryProperties)" :checked="memoryProperties.operation === `set` && memoryProperties.value != null"/> Set a value </label></div>
					<div v-show="memoryProperties.value != null" class="memory-details">Value: <input  v-model="memoryProperties.value" size="30" type="text" placeholder=""/></div>

					<div v-show="!isPromptMemory"><label><input type="radio" @click="memorySetReference(memoryProperties, isPromptMemory)" :checked="memoryProperties.operation === `set` && memoryProperties.reference != null"/> Set a reference </label></div>
					<div v-show="memoryProperties.reference != null && !isPromptMemory" class="memory-details">Reference: <input  v-model="memoryProperties.reference" size="30" type="text" placeholder=""/></div>

					<div><label><input type="radio" @click="memoryUnsetValue(memoryProperties)" :checked="memoryProperties.operation === `unset`"/> Unset </label></div>
				</dd>
			</template>
		</dl>
		<button class="add-memory-key" @click="addMemory(memoryParent)">Add memory key</button>
	</div>

</template>


<script>
	import Vue from 'vue';

	export default {
		props: [
			`validation`,
			`memoryParent`,
			`memory`,
			`options`,
			`memoryKeys`,
			`isPromptMemory`,
		],
		data: function () {
			return {
				transformTypes: {
					preserve: `None`,
					boolean: `Boolean (true/false)`,
					time: `Time (converts to 24 hour clock)`,
					integer: `Integer (whole number)`,
					float: `Float (decimal number)`,
					lowercase: `Lowercase`,
					uppercase: `Uppercase`,
				},
			};
		},
		methods: {
			memorySetInput (memoryProperties) {

				Vue.set(memoryProperties, `operation`, `set`);

				Vue.delete(memoryProperties, `value`);
				Vue.delete(memoryProperties, `reference`);
				Vue.set(memoryProperties, `regexp`, `(.+)`);

			},

			memorySetValue (memoryProperties) {

				Vue.set(memoryProperties, `operation`, `set`);

				Vue.delete(memoryProperties, `regexp`);
				Vue.delete(memoryProperties, `reference`);
				Vue.set(memoryProperties, `value`, `true`);

			},

			memorySetReference (memoryProperties) {

				Vue.set(memoryProperties, `operation`, `set`);

				Vue.delete(memoryProperties, `regexp`);
				Vue.delete(memoryProperties, `value`);
				Vue.set(memoryProperties, `reference`, ``);
				Vue.set(memoryProperties, `required`, false);

			},

			memoryUnsetValue (memoryProperties) {

				Vue.set(memoryProperties, `operation`, `unset`);

				Vue.delete(memoryProperties, `regexp`);
				Vue.delete(memoryProperties, `value`);
				Vue.delete(memoryProperties, `reference`);

			},
			addMemory (memoryParent) {

				const memoryKey = ``;
				const memoryData = {
					operation: `set`,
					regexp: `(.+)`,
					transform: `preserve`,
					reference: null,
				};

				if (typeof memoryParent.memory === `undefined`) {
					Vue.set(memoryParent, `memory`, {});
				}

				Vue.set(memoryParent.memory, memoryKey, memoryData);

				const memoryIndex = Object.keys(memoryParent.memory).length - 1;
				setTimeout(() => {
					// this.validateMemory(memoryIndex, this.$refs.memoryKeys[memoryIndex]);
					this.$refs.memoryKeys[memoryIndex].focus();
				}, 200);

			},
			removeMemory (memoryKey, memory) {
				Vue.delete(memory, memoryKey);
			},
			updateMemoryKey (memoryProperties, newMemoryKey, event, memoryParent) {

				const oldMemoryKey = event.target.dataset.oldKey;

				// Vue data binding does not work for objects: add new key and remove old one.
				Vue.set(memoryParent.memory, newMemoryKey, memoryProperties);
				Vue.delete(memoryParent.memory, oldMemoryKey);

			},
			validateMemory (memoryIndex, eventOrElement) {
				const inputEl = eventOrElement.target || eventOrElement;

				Vue.set(this.validation, `memory`, this.validation.memory || { });
				if (!inputEl.validity.valid) {
					Vue.set(this.validation.memory, `i${memoryIndex}`, inputEl.title);
				}
				else {
					Vue.delete(this.validation.memory, `i${memoryIndex}`);
				}
			},
		},
	};

</script>

<style lang="scss" scoped>

	dl dt {
		border-bottom: 1px solid #000;
		background-color: #eee;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	dt:not(:first-child) {
		margin-top: 2.00rem;
	}

	.memory-details {
		padding-left: 2rem;
	}

	.inline-help {
		font-size: 0.8rem;
		color: #888;
	}

	.inline-error {
		font-size: 0.8rem;
		color: #f33;
	}

	button.add-memory-key {
		margin-top: 2.00rem;
	}

</style>
