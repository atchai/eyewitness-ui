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
 * Export.
 */
export {
	updateStoreObjectItem,
};
