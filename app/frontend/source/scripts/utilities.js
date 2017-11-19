/*
 * UTILITIES
 */

/*
 * Updates the given object item with the given payload.
 */
function updateStoreObjectItem (object, payload) {

	if (payload.field) {
		object[payload.key][payload.field] = payload.data;
	}
	else {
		object[payload.key] = payload.data;
	}

}

/*
 * Removes the given object item with the given key.
 */
function removeStoreObjectItem (object, payload) {
	delete object[payload.key];
}

/*
 * Export.
 */
export {
	updateStoreObjectItem,
	removeStoreObjectItem,
};
