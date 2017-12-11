/*
 * UTILITIES
 */

import deepSort from 'deep-sort';
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
	if (typeof payload.data !== `undefined`) {
		dictionary[key] = payload.data;
	}

	// Otherwise just replace a single field in the item.
	else if (typeof payload.dataField !== `undefined` && typeof payload.dataValue !== `undefined`) {
		dictionary[key][payload.dataField] = payload.dataValue;
	}

	// Otherwise do we have a function we can execute?
	else if (typeof payload.dataFunction === `function`) {
		dictionary[key] = payload.dataFunction(dictionary[key], payload);
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
 *
 */
function sortObjectPropertiesByKey (existingDictionary, keyProperty, sortProperty, sortDirection) {

	// Convert
	const dictionaryAsArray = Object.values(existingDictionary);
	const newDictionary = {};

	deepSort(dictionaryAsArray, sortProperty, sortDirection);

	dictionaryAsArray.forEach(item => {
		const keyValue = item[keyProperty];
		newDictionary[keyValue] = item;
	});

	return newDictionary;

}

/*
 * Mark a component as currently loading.
 */
function setLoadingStarted (cmp, delay = 50) {

	cmp.isLoading = false;
	cmp.loadingState = 0;

	setTimeout(() => {
		if (cmp.loadingState === 0) {
			cmp.isLoading = true;
			cmp.loadingState = 1;
		}
	}, delay);

}

/*
 * Mark a component as finished loaded.
 */
function setLoadingFinished (cmp) {
	cmp.isLoading = false;
	cmp.loadingState = -1;
}

/*
 * Export.
 */
export {
	addStorePropertyItem,
	updateStorePropertyItem,
	removeStorePropertyItem,
	sortObjectPropertiesByKey,
	setLoadingStarted,
	setLoadingFinished,
};
