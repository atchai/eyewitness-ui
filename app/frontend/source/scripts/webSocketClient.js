/*
 * WEB SOCKET CLIENT
 */

import socketClient from 'socket.io-client';

let socket;

/*
 * Connect to the server and setup event listeners.
 */
function setupWebSocketClient (store) {

	socket = socketClient.connect(process.env.SERVER_URI);

	socket.on(`welcome`, data => {
		store.commit(`update-threads`, data.threads);
		store.commit(`update-articles`, data.articles);
		store.commit(`set-show-stories`, data.showStories);
		store.commit(`update-welcome-messages`, data.welcomeMessages);
		store.commit(`set-max-old-thread-messages`, data.maxOldThreadMessages);
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

					store.commit(`add-thread`, {
						key: threadId,
						data: resData.thread,
					});

				}
			);
		}

		// Add the new message to the thread.
		store.commit(`add-thread-message`, {
			key: threadId,
			newMessage,
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
