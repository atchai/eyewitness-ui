/*
 * UTILITIES
 */

import Vue from 'vue';

/*
 * Adds a single item to the given state property.
 */
function addStorePropertyItem (state, property, payload) {

	const dictionary = state[property];

	state[property] = Object({
		...dictionary,
		[payload.key]: payload.data,
	});

}

/*
 * Updates a single item on the given state property.
 */
function updateStorePropertyItem (state, property, payload) {

	const dictionary = state[property];
	const key = payload.key;

	// Replace the item in its entirety.
	if (payload.data) {
		dictionary[key] = payload.data;
	}

	// Otherwise just replace a single field in the item.
	else if (payload.dataField && payload.dataValue) {
		dictionary[key][payload.dataField] = payload.dataValue;
	}

	// Whoops!
	else {
		throw new Error(`You must specify either "data" or "dataField" and "dataValue" when updating store items.`);
	}

}

/*
 * Removes a single item on the given state property.
 */
function removeStorePropertyItem (state, property, payload) {
	Vue.delete(state[property], payload.key);
}

/*
 * Export.
 */
export {
	addStorePropertyItem,
	updateStorePropertyItem,
	removeStorePropertyItem,
};
