/*
 * WEB SOCKET CLIENT
 */

import socketClient from 'socket.io-client';

let socket;

/*
 * Connect to the server and setup event listeners.
 */
function setupWebSocketClient (store, router) {

	socket = socketClient.connect(process.env.SERVER_URI);

	socket.on(`messaging/thread/new-message`, data => {

		const hasThread = store.getters.hasThread(data.threadId);

		// If we have not spoken to this user before we must ask the backend for the full thread data.
		if (!hasThread) {

			return socket.emit(
				`messaging/thread/get-info`,
				{ itemId: data.threadId },
				resData => {

					if (!resData || !resData.success) { return alert(`There was a problem loading in a new thread.`); }

					// Add the new thread.
					store.commit(`add-thread`, {
						key: data.threadId,
						data: resData.thread,
						sortField: `latestDate`,
						sortDirection: `desc`,
					});

				}
			);

		}

		const { path: curPath, params: curParams } = router.history.current;
		const isThreadVisible = (curPath.match(/^\/messaging\/thread/) && curParams.itemId === data.threadId);

		// Add the new message to the thread.
		if (isThreadVisible) {
			store.commit(`add-message`, {
				key: data.message.itemId,
				data: data.message,
			});
		}

		// Update thread meta.
		store.commit(`update-thread`, {
			key: data.threadId,
			dataFunction: (stateProperty) => {
				stateProperty.latestDate = data.latestDate;
				stateProperty.latestMessage = data.latestMessage;
				return stateProperty;
			},
			sortField: `latestDate`,
			sortDirection: `desc`,
		});

	});

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
