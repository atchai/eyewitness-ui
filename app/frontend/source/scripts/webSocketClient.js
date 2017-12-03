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

		store.commit(`update-thread`, {
			key: threadId,
			dataFunction: thread => {

				const messages = Array.from(thread.messages);

				messages.push({
					messageId: newMessage.messageId,
					direction: newMessage.direction,
					humanToHuman: newMessage.humanToHuman,
					sentAt: newMessage.sentAt,
					data: newMessage.data,
				});

				thread.messages = messages;

				if (newMessage.direction === `incoming` && newMessage.sentAt && newMessage.data.text) {
					thread.latestDate = newMessage.sentAt;
					thread.latestMessage = newMessage.data.text;
				}

				return thread;

			},
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
