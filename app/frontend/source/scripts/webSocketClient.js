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
		store.commit(`set-show-stories`, data.settings.showStories);
		store.commit(`update-welcome-messages`, data.settings.welcomeMessages);
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
