/*
 * WEB SOCKET CLIENT
 */

import socketClient from 'socket.io-client';

let socket;

/*
 * If we have not spoken to this user before we must ask the backend for the full thread data.
 */
function ensureFullThread (store, threadId) {

	return new Promise((resolve, reject) => {

		// Nothing to do if we already have the thread.
		const hasThread = store.getters.hasThread(threadId);

		if (hasThread) {
			resolve();
			return;
		}

		// Request the thread data from the backend.
		socket.emit(
			`messaging/thread/get-info`,
			{ itemId: threadId },
			resData => {

				if (!resData || !resData.success) {
					alert(`There was a problem loading in a new thread.`);
					reject();
					return;
				}

				// Add the new thread.
				store.commit(`add-thread`, {
					key: resData.thread.itemId,
					data: resData.thread,
					sortField: `latestDate`,
					sortDirection: `desc`,
				});

				resolve();

			}
		);

	});

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
async function handleNewMessages (store, router, data) {

	const threadId = data.thread.itemId;

	// If we have not spoken to this user before we must ask the backend for the full thread data.
	await ensureFullThread(store, threadId);

	// Add the new message to the store if the thread is currently visible.
	if (isThreadVisible(router, threadId)) {
		store.commit(`add-message`, {
			key: data.message.itemId,
			data: data.message,
		});
	}

	// Update thread meta.
	store.commit(`update-thread`, {
		key: threadId,
		dataFunction: (stateProperty) => {
			stateProperty.latestDate = data.thread.latestDate;
			stateProperty.latestMessage = data.thread.latestMessage;
			return stateProperty;
		},
		sortField: `latestDate`,
		sortDirection: `desc`,
	});

}

/*
 * Handles memory changes pushed to the frontend from the backend.
 */
async function handleMemoryChanges (store, router, data) {

	const threadId = data.thread.itemId;
	const { key, operation, newValue } = data.memory;
	const keyFormatted = key.replace(/^appData\./i, ``);

	// If we have not spoken to this user before we must ask the backend for the full thread data.
	await ensureFullThread(store, threadId);

	// Update the bot memory if its thread is currently visible.
	if (isThreadVisible(router, threadId)) {

		if (operation === `set`) {

			const action = (store.getters.hasBotMemory(keyFormatted) ? `update-bot-memory` : `add-bot-memory`);

			store.commit(action, {
				key: keyFormatted,
				data: newValue,
			});

		}
		else {

			store.commit(`remove-bot-memory`, {
				key: keyFormatted,
			});

		}

	}

	// Update thread meta when certain memory changes are detected.
	if ([ `enquiryType`, `conversationState` ].includes(keyFormatted)) {
		store.commit(`update-thread`, {
			key: threadId,
			dataField: keyFormatted,
			dataValue: (keyFormatted === `conversationState` && !newValue ? `closed` : newValue),
		});
	}

}

/*
 * Connect to the server and setup event listeners.
 */
function setupWebSocketClient (store, router) {

	socket = socketClient.connect(process.env.SERVER_URI);

	socket.on(`messaging/thread/new-message`, data => handleNewMessages(store, router, data));
	socket.on(`messaging/thread/memory-change`, data => handleMemoryChanges(store, router, data));

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
