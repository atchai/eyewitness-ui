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

	socket.on(`welcome`, data => {

		if (data.threads) { store.commit(`update-threads`, data.threads); }
		if (data.articles) { store.commit(`update-articles`, data.articles); }
		if (data.welcomeMessages) { store.commit(`update-welcome-messages`, data.welcomeMessages); }

	});

	socket.on(`thread/new-message`, data => {

		const threadId = data.threadId;
		const newMessage = data.message;
		const hasThread = store.getters.hasThread(threadId);

		// If we have not spoken to this user before we must ask the backend for the full thread data.
		if (!hasThread) {
			return socket.emit(
				`thread/pull`,
				{ threadId },
				resData => {

					if (!resData || !resData.success) { return alert(`There was a problem loading in a new thread.`); }

					// Add the new thread.
					store.commit(`add-thread`, {
						key: threadId,
						data: resData.thread,
					});

					// Do we need to sort the threads?
					const newThreadsDictionary = sortObjectPropertiesByKey(store.state.threads, `threadId`, `latestDate`, `desc`);
					store.commit(`update-threads`, newThreadsDictionary);

				}
			);
		}

		// Add the new message to the thread.
		store.commit(`add-thread-message`, {
			key: threadId,
			newMessage,
			latestDate: data.latestDate,
			latestMessage: data.latestMessage,
		});

		// Do we need to sort the threads?
		if (newMessage.direction === `incoming`) {
			const newThreadsDictionary = sortObjectPropertiesByKey(store.state.threads, `threadId`, `latestDate`, `desc`);
			store.commit(`update-threads`, newThreadsDictionary);
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
