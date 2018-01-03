/*
 * UTILITIES
 */

import deepSort from 'deep-sort';
import Vue from 'vue';

/*
 * Adds a single item to the given state property and resorts the keys.
 */
function addStorePropertyItem (state, property, { key, data, keyField, sortField, sortDirection }) {

	const dictionary = state[property];

	const newDictionary = Object({
		...dictionary,
		[key]: data,
	});

	if (sortField && sortDirection) {
		state[property] = sortObjectPropertiesByKey(dictionary, keyField || `itemId`, sortField, sortDirection);
	}
	else {
		state[property] = newDictionary;
	}

}

/*
 * Adds multiple item to the given state property and resorts the keys after adding them all.
 */
function addStorePropertyItems (state, property, { data, keyField, sortField, sortDirection }) {

	Object.values(data).forEach(item => {
		const itemPayload = { key: item.itemId, data: item };
		addStorePropertyItem(state, property, itemPayload);
	});

	if (sortField && sortDirection) {
		state[property] = sortObjectPropertiesByKey(state[property], keyField || `itemId`, sortField, sortDirection);
	}

}

/*
 * Updates select items in the property if a key field is specified, otherwise replaces all items in the property.
 */
function updateStoreProperty (state, property, { replaceByKeyField, data, keyField, sortField, sortDirection }) {

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

	// Do we need to sort the store property.
	if (sortField && sortDirection) {
		state[property] = sortObjectPropertiesByKey(state[property], keyField || `itemId`, sortField, sortDirection);
	}

}

/*
 * Updates a single item on the given state property.
 */
function updateStorePropertyItem (state, property, payload) {

	const dictionary = state[property];
	const { key, data, dataField, dataValue, dataFunction, keyField, sortField, sortDirection } = payload;

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

	// Do we need to sort the store property.
	if (sortField && sortDirection) {
		state[property] = sortObjectPropertiesByKey(state[property], keyField || `itemId`, sortField, sortDirection);
	}

}

/*
 * Removes a single item on the given state property.
 */
function removeStorePropertyItem (state, property, { key }) {
	Vue.delete(state[property], key);
}

/*
 * Helper to sort object properties.
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
function setLoadingStarted (cmp, force = false, maxRouteSpecificity = false, delay = 50) {

	cmp.isLoading = false;
	cmp.loadingState = 0;

	// Find the route path that matched (depending on whether we need to match just the tab part or the full path).
	let matchedRoute;

	if (maxRouteSpecificity) {
		matchedRoute = cmp.$route.fullPath.toLowerCase();
	}
	else {
		matchedRoute = cmp.$route.matched[0].path.toLowerCase();
	}

	// If we are already on the route path lets not fetch again.
	if (!force && cmp.loadingRoute === matchedRoute) { return false; }
	cmp.loadingRoute = matchedRoute;

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
 * Load in new items as the user scrolls a container div.
 */
function handleOnScroll ( // eslint-disable-line max-params
	cmp,
	scrollContainerId,
	elementClass,
	storeUpdateAction,
	storeProperty,
	scrollTop,
	keepItemsFat,
	recursive = false
) {

	// Get the elements.
	const scrollDirection = (scrollTop >= cmp.lastScrollTop ? `down` : `up`);
	const { $inRangeElements, $lostRangeElements } =
		getScrollElementsInRange(scrollContainerId, elementClass, APP_CONFIG.pageBufferSize, scrollTop, scrollDirection);

	// Convert to items.
	const inRangeItems = convertElementsToItems($inRangeElements, storeProperty);
	const lostRangeItems = convertElementsToItems($lostRangeElements, storeProperty);

	// Filter down to just the thin items that are in range and need fattening up.
	const thinInRangeItems = inRangeItems.filter(item => !item.isFullFat);

	// Ensure we are keeping items that must remain fat!
	const hasItemsToKeep = (Array.isArray(keepItemsFat) && keepItemsFat.length);
	if (hasItemsToKeep) {

		keepItemsFat.forEach(keepItemId => {
			const alreadyExists = inRangeItems.find(inRangeItem => inRangeItem.itemId === keepItemId);
			if (alreadyExists) { return; }

			inRangeItems.push(storeProperty[keepItemId]);
		});

	}

	// Replace the fat items that have just gone out of range with thinner copies.
	lostRangeItems.forEach(item => {

		// Skip items that must remain fat.
		const mustRemainFat =
			(hasItemsToKeep ? keepItemsFat.find(keepItemId => keepItemId === item.itemId) : null) ||
			inRangeItems.find(inRangeItem => inRangeItem.itemId === item.itemId);

		if (mustRemainFat) { return; }

		// Put item on a diet and make it thin!
		cmp.$store.commit(storeUpdateAction, {
			key: item.itemId,
			data: { itemId: item.itemId },
		});

	});

	// Get just the IDs for the next stage.
	const itemIdsToFetch = thinInRangeItems.map(item => item.itemId);

	// Load in new items, if any.
	if (itemIdsToFetch.length) { cmp.fetchComponentData(itemIdsToFetch); }

	// Cache this for the next call.
	cmp.lastScrollTop = scrollTop;

	// Cope with onScroll not being called when scrolling has finished because the event is being throttled.
	if (!recursive) {

		if (cmp.lastLoadTimeout) { clearTimeout(cmp.lastLoadTimeout); }

		cmp.lastLoadTimeout = setTimeout(
			() => {
				const $scrollContainer = document.getElementById(scrollContainerId);
				if (!$scrollContainer) { return; }

				const finalScrollTop = $scrollContainer.scrollTop;
				handleOnScroll(
					cmp,
					scrollContainerId,
					elementClass,
					storeUpdateAction,
					storeProperty,
					finalScrollTop,
					keepItemsFat,
					true
				);

				cmp.lastLoadTimeout = null;
			},
			APP_CONFIG.scrollThrottleThreshold * 2
		);

	}

}

/*
 * Returns only the elements within the scroll container that are in range.
 */
function getScrollElementsInRange (scrollContainerId, elementClass, rangeBufferSize, scrollTop, scrollDirection) {

	const $scrollContainer = document.getElementById(scrollContainerId);
	const scrollContainerHeight = $scrollContainer.clientHeight;
	const scrollBottom = scrollTop + scrollContainerHeight;
	const $allElements = Array.from($scrollContainer.getElementsByClassName(elementClass));

	// No items in the DOM.
	if (!$allElements.length) { return []; }

	const elementHeight = $allElements[0].clientHeight;
	const maxIndex = $allElements.length - 1;
	let firstVisibleItemIndex = null;
	let lastVisibleItemIndex = null;

	// Find the first and last visible element indexes.
	for (let index = 0; index <= maxIndex; index++) {
		const $element = $allElements[index];
		const elementTop = $element.offsetTop;
		const elementBottom = elementTop + elementHeight;

		// First item that is completely within the scroll view.
		if (firstVisibleItemIndex === null && elementBottom >= scrollTop && elementTop <= scrollBottom) {
			firstVisibleItemIndex = index;
		}

		// First item that is just past the bottom of the scroll view.
		if (lastVisibleItemIndex === null && elementTop > scrollBottom) {
			const prevIndex = (index > 0 ? index - 1 : 0);
			lastVisibleItemIndex = prevIndex;
		}
	}

	// If we found the first visible item, but not the last visible one, then the last one must be the last in the list.
	if (firstVisibleItemIndex && lastVisibleItemIndex === null) {
		lastVisibleItemIndex = maxIndex;
	}

	// Find the very top element we want to be fat.
	const topBufferSize = rangeBufferSize * (scrollDirection === `up` ? 2 : 1);
	const topInRangeIndex = Math.max(firstVisibleItemIndex - topBufferSize, 0);

	// Find the very bottom element we want to be fat.
	const bottomBufferSize = rangeBufferSize * (scrollDirection === `down` ? 2 : 1);
	const bottomInRangeIndex = Math.min(lastVisibleItemIndex + bottomBufferSize, maxIndex);

	// Grab only the elements we want to be fat.
	const $inRangeElements = $allElements.slice(topInRangeIndex, bottomInRangeIndex + 1);

	// Grab the elements that have just gone out of range.
	const $lostRangeElements = [];

	if (scrollDirection === `up`) {
		$lostRangeElements.push(...$allElements.slice(bottomInRangeIndex + 1, maxIndex + 1));
	}
	else {
		$lostRangeElements.push(...$allElements.slice(0, topInRangeIndex));
	}

	return { $inRangeElements, $lostRangeElements };

}

/*
 * Returns an array of items to replace the array of elements.
 */
function convertElementsToItems ($elements, storeDictionary) {

	const items = $elements.map($element => {
		const itemId = $element.getAttribute(`data-item-id`);
		return storeDictionary[itemId];
	});

	return items;

}

/*
 * Export.
 */
export {
	addStorePropertyItem,
	addStorePropertyItems,
	updateStoreProperty,
	updateStorePropertyItem,
	removeStorePropertyItem,
	sortObjectPropertiesByKey,
	setLoadingStarted,
	setLoadingFinished,
	handleOnScroll,
};
