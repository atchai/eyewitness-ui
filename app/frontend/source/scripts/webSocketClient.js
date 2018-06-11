/*
 * WEB SOCKET CLIENT
 */

import socketClient from 'socket.io-client';

let socket;

/*
 * If we have not spoken to this user before we must ask the backend for the full thread data.
 */
function ensureFullThread (store, threadId) {

	// Nothing to do if we already have the thread.
	const hasThread = store.getters.hasThread(threadId);
	if (hasThread) { return true; }

	// Request the thread data from the backend.
	socket.emit(
		`messaging/thread/get-info`,
		{ itemId: threadId },
		resData => {

			if (!resData || !resData.success) {
				alert(`There was a problem loading in a new thread.`);
				return;
			}

			// Add the new thread.
			store.commit(`add-thread`, {
				key: resData.thread.itemId,
				data: resData.thread,
				sortField: `latestDate`,
				sortDirection: `desc`,
			});

		}
	);

	// We need to wait for the thread.
	return false;

}

/*
 * Returns true if the given thread is currently selected and visible in the UI.
 */
function isThreadVisible (router, threadId) {

	const { path: curPath, params: curParams } = router.history.current;
	const visible = (curPath.match(/^\/messaging\/thread/) && curParams.itemId === threadId);

	return visible;

}

/*
 * Handles new messages pushed to the frontend from the backend.
 */
function handleNewMessages (store, router, data) {

	const threadId = data.thread.itemId;

	// If we have not spoken to this user before we must ask the backend for the full thread data.
	const hasThread = ensureFullThread(store, threadId);
	if (!hasThread) { return; }

	// Add the new message to the store if the thread is currently visible.
	if (isThreadVisible(router, threadId)) {
		store.commit(`add-message`, {
			key: data.message.itemId,
			data: data.message,
		});
	}

	// Update thread meta.
	store.commit(`update-thread`, {
		key: data.thread.itemId,
		dataFunction: (stateProperty) => {
			stateProperty.latestDate = data.thread.latestDate;
			stateProperty.latestMessage = data.thread.latestMessage;
			return stateProperty;
		},
		sortField: `latestDate`,
		sortDirection: `desc`,
	});

}


			sortDirection: `desc`,
		});

 * Connect to the server and setup event listeners.
 */
function setupWebSocketClient (store, router) {

	socket = socketClient.connect(process.env.SERVER_URI);

	socket.on(`messaging/thread/new-message`, handleNewMessages.bind(null, store, router));
	socket.on(`messaging/thread/memory-change`, handleMemoryChanges.bind(null, store, router));

	return socket;

}

/*
 * Returns the web socket instance.
 */
function getSocket () {
	return socket;
}

/*
 * Export.
 */
export {
	setupWebSocketClient,
	getSocket,
};
