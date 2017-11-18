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
 * Export.
 */
module.exports = {
	mapListToDictionary,
};
