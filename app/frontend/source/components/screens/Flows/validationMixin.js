
import Vue from 'vue';

module.exports = {
	data: function () {
		return {
			validation: {},
		};
	},
	methods: {
		validate (eventOrElement) {
			const inputEl = eventOrElement.target || eventOrElement;
			const field = inputEl.dataset.field;
			if (!inputEl.validity.valid) {
				Vue.set(this.validation, field, inputEl.title);
			}
			else {
				Vue.delete(this.validation, field);
			}
		},
	},
};
