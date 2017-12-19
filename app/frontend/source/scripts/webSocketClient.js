/*
 * WEB SOCKET CLIENT
 */

import socketClient from 'socket.io-client';
import { sortObjectPropertiesByKey } from './utilities';

let socket;

/*
 * Connect to the server and setup event listeners.
 */
function setupWebSocketClient (store) {

	socket = socketClient.connect(process.env.SERVER_URI);

	socket.on(`messaging/thread/new-message`, data => {

		const itemId = data.itemId;
		const newMessage = data.message;
		const hasThread = store.getters.hasThread(itemId);

		// If we have not spoken to this user before we must ask the backend for the full thread data.
		if (!hasThread) {
			return socket.emit(
				`messaging/thread/get-info`,
				{ itemId },
				resData => {

					if (!resData || !resData.success) { return alert(`There was a problem loading in a new thread.`); }

					// Add the new thread.
					store.commit(`add-thread`, {
						key: itemId,
						data: resData.thread,
					});

					// Do we need to sort the threads?
					const newThreadsDictionary = sortObjectPropertiesByKey(store.state.threads, `itemId`, `latestDate`, `desc`);
					store.commit(`update-threads`, { data: newThreadsDictionary });

				}
			);
		}

		// Add the new message to the thread.
		store.commit(`add-thread-message`, {
			key: itemId,
			newMessage,
			latestDate: data.latestDate,
			latestMessage: data.latestMessage,
		});

		// Do we need to sort the threads?
		if (newMessage.direction === `incoming`) {
			const newThreadsDictionary = sortObjectPropertiesByKey(store.state.threads, `itemId`, `latestDate`, `desc`);
			store.commit(`update-threads`, { data: newThreadsDictionary });
		}

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
