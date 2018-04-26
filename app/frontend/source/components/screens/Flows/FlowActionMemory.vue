<!--
	FLOW ACTION MEMORY
-->

<template>

	<div>
		<p v-if="memory && memory.length === 0">None</p>
		<dl v-else v-model="memory">
			<template v-for="(memoryProperties, memoryKey, memoryIndex) in memory">
				<dt>
					Key: <input :data-old-key="memoryKey" v-model.lazy="memoryKey" @change="updateMemoryKey(memoryProperties, memoryKey, $event, isPromptMemory)" required
					 @input="validateMemory(memoryIndex, $event)" title="Required - alphanumeric characters and underscores only" size="30" type="text" pattern="[A-Za-z0-9_/]+" list="memoryKeys"/>
					<button @click="removeMemory(memoryKey, index, isPromptMemory)" class="mini">Remove</button>
					<p class="inline-error" v-if="validation.memory && validation.memory[`i`+memoryIndex]">{{validation.memory[`i`+memoryIndex]}}</p>
				</dt>
				<dd>
					<div>Transform: <select v-model="memoryProperties.transform" required>
						<option v-for="(transformTypeName, transformTypeKey) in transformTypes" :value="transformTypeKey">{{transformTypeName}}</option>
					</select></div>

					<div><label><input type="radio" @click="memorySetInput(memoryProperties, isPromptMemory)" :checked="memoryProperties.operation === `set` && memoryProperties.regexp != null"/> Save user input </label></div>
					<div v-show="memoryProperties.regexp != null" class="memory-details">
						<div>
							<label> Simple match:
								<select v-model="memoryProperties.regexp">
									<option value="" disabled></option>
									<option value="(.+)">Anything</option>
									<option value="(\w+)">Single word</option>
									<option value="([1-9][0-9]? ((hours)|(hour)|(days)|(day)|(weeks)|(week)|(months)|(month)|(minutes)|(minute)))">Time period (eg. "2 days")</option>
									<!-- <option value="([0-2][0-9]:[0-5][0-9])">Military time (eg. "07:00")</option> -->
									<option v-for="selection in selections" :value="`(${selection.label})`">Reply: {{selection.label}}</option>
								</select>
							</label>
						</div>
						<div><label>Regular expression: <input type="text" pattern=".*" v-model="memoryProperties.regexp"/></label></div>
						<p class="inline-help">The <em>regular expression</em> is automatically set based on the <em>simple match</em> above, you only need to manually override this if you need more complex matching.</p>
						<div><label><input v-model="memoryProperties.required" type="checkbox"/> ask user to try again if not matched </label></div>
					</div>

					<div><label><input type="radio" @click="memorySetValue(memoryProperties, isPromptMemory)" :checked="memoryProperties.operation === `set` && memoryProperties.value != null"/> Set a value </label></div>
					<div v-show="memoryProperties.value != null" class="memory-details">Value: <input  v-model="memoryProperties.value" size="30" type="text" placeholder=""/></div>

					<div v-show="!isPromptMemory"><label><input type="radio" @click="memorySetReference(memoryProperties, isPromptMemory)" :checked="memoryProperties.operation === `set` && memoryProperties.reference != null"/> Set a reference </label></div>
					<div v-show="memoryProperties.reference != null && !isPromptMemory" class="memory-details">Reference: <input  v-model="memoryProperties.reference" size="30" type="text" placeholder=""/></div>

					<div><label><input type="radio" @click="memoryUnsetValue(memoryProperties, isPromptMemory)" :checked="memoryProperties.operation === `unset`"/> Unset </label></div>
				</dd>
			</template>
		</dl>
		<button class="add-memory-key" @click="addMemory(index, isPromptMemory)">Add memory key</button>
	</div>

</template>


<script>

	export default {
		props: [
			`validateMemory`,
			`addMemory`,
			`removeMemory`,
			`memorySetInput`,
			`memorySetValue`,
			`memorySetReference`,
			`memoryUnsetValue`,
			`updateMemoryKey`,
			`validation`,
			`transformTypes`,
			`index`,
			`memory`,
			`selections`,
			`memoryKeys`,
			`isPromptMemory`,
		],
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
