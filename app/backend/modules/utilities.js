'use strict';

/*
 * UTILITIES
 */

/*
 * Converts a list to a dictionary with the given field used as the dictionary key.
 */
function mapListToDictionary (list, keyField) {

	const dictionary = {};

	list.forEach(item => {
		const keyValue = item[keyField];
		dictionary[keyValue] = item;
	});

	return dictionary;

}

/*
 * Calls the given handler method to process the incoming socket event, and catches any resulting errors.
 */
async function handleSocketEvent (handler, data, reply) {

	try {

		await handler(data, reply);

	}
	catch (err) {
		console.error(`Socket Handler Error:\n`, err.stack); // eslint-disable-line no-console
		return reply({ success: false, error: err.message });
	}

}

/*
 * Export.
 */
module.exports = {
	mapListToDictionary,
	handleSocketEvent,
};
