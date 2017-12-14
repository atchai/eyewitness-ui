/*
 * UTILITIES
 */

import deepSort from 'deep-sort';
import Vue from 'vue';

/*
 * Adds a single item to the given state property.
 */
function addStorePropertyItem (state, property, { key, data }) {

	const dictionary = state[property];

	state[property] = Object({
		...dictionary,
		[key]: data,
	});

}

/*
 * Updates select items in the property if a key field is specified, otherwise replaces all items in the property.
 */
function updateStoreProperty (state, property, { replaceByKeyField, data }) {

	// Replace only specific items in the property based on what we have in the payload.
	if (replaceByKeyField) {

		Object.values(data).forEach(item =>
			updateStorePropertyItem(state, property, {
				key: item[replaceByKeyField],
				data: item,
			})
		);
	}

	// Replace entire property with the new payload.
	else {
		state[property] = data;
	}

}

/*
 * Updates a single item on the given state property.
 */
function updateStorePropertyItem (state, property, payload) {

	const dictionary = state[property];
	const { key, data, dataField, dataValue, dataFunction } = payload;

	// Replace the item in its entirety.
	if (typeof data !== `undefined`) {
		dictionary[key] = data;
	}

	// Otherwise just replace a single field in the item.
	else if (typeof dataField !== `undefined` && typeof dataValue !== `undefined`) {
		dictionary[key][dataField] = dataValue;
	}

	// Otherwise do we have a function we can execute?
	else if (typeof dataFunction === `function`) {
		dictionary[key] = dataFunction(dictionary[key], payload);
	}

	// Whoops!
	else {
		throw new Error(`You must specify either "data" or "dataField" and "dataValue" when updating store items.`);
	}

}

/*
 * Removes a single item on the given state property.
 */
function removeStorePropertyItem (state, property, { key }) {
	Vue.delete(state[property], key);
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

	// Find the top level route path that matched.
	const matchedTopRoute = cmp.$route.matched[0].path.toLowerCase();

	// If we are already on the top level route path lets not fetch again.
	if (cmp.loadingRoute === matchedTopRoute) { return false; }
	cmp.loadingRoute = matchedTopRoute;

	// Show the loader after a short delay to avoid flashing.
	setTimeout(() => {
		if (cmp.loadingState === 0) {
			cmp.isLoading = true;
			cmp.loadingState = 1;
		}
	}, delay);

	// Allow the tab to fetch the data it needs.
	return true;

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
	updateStoreProperty,
	updateStorePropertyItem,
	removeStorePropertyItem,
	sortObjectPropertiesByKey,
	setLoadingStarted,
	setLoadingFinished,
};
