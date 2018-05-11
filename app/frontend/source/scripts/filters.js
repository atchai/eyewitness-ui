/*
 * VUE FILTERS
 */

import moment from 'moment';
import Vue from 'vue';

/*
 * Allows dates to be formatted using momentjs.
 */
Vue.filter(`formatDate`, (value, format) => {
	const date = moment(value);
	return date.format(format);
});

/*
 * Allows dates to be formatted using momentjs relative to the current date and time.
 */
Vue.filter(`formatDateAsRelative`, (value) => {
	const date = moment(value);
	return date.from(moment());
});

/*
 * Format the enquiry type to make it more user friendly.
 */
Vue.filter(`enquiryType`, (value) => {
	switch (value) {
		case `submit a story`: case `submit a tip`: return `-story-`;
		case `advertise`: return `-advertise-`;
		case `other`: return `-other-`;
		default: return ``;
	}
});
