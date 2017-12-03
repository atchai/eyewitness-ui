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

		const messages = Array.from(store.state.threads[data.threadId].messages);

		messages.push({
			messageId: data.message.messageId,
			direction: data.message.direction,
			humanToHuman: data.message.humanToHuman,
			sentAt: data.message.sentAt,
			data: data.message.data,
		});

		store.commit(`update-thread`, {
			key: data.threadId,
			dataField: `messages`,
			dataValue: messages,
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
