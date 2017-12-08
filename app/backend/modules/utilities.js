'use strict';

/*
 * UTILITIES
 */

/*
 * Converts a list to a dictionary with the given field used as the dictionary key.
 */
function mapListToDictionary (list, keyField) {

	const dictionary = {};

	list.forEach(item => {
		const keyValue = item[keyField];
		dictionary[keyValue] = item;
	});

	return dictionary;

}

/*
 * Calls the given handler method to process the incoming socket event, and catches any resulting errors.
 */
async function handleSocketEvent (socket, handler, data, reply) {

	try {

		// Call the handler function and pass down the scope of its controller.
		await handler.call(this, socket, data, reply);

	}
	catch (err) {
		console.error(`Socket Handler Error:\n`, err.stack); // eslint-disable-line no-console
		return reply({ success: false, error: err.message });
	}

}

/*
 * Returns the message and date information for the given message, if it is the latest incoming message.
 */
function getLatestMessageInformation (message) {

	// We only care about messages the user sent.
	if (!message || message.direction !== `incoming`) { return {}; }

	const latestDate = message.sentAt;
	let latestMessage = `[No Text]`;
	const text = message.text || (message.data && message.data.text) || null;
	const attachments = message.attachments || (message.data && message.data.attachments) || [];

	if (text) {
		latestMessage = text;
	}
	else if (attachments.length) {
		const type = attachments[0].type;
		latestMessage = `[${type[0].toUpperCase()}${type.substr(1)} Attachment]`;
	}

	return { latestDate, latestMessage };

}

/*
 * Export.
 */
module.exports = {
	mapListToDictionary,
	handleSocketEvent,
	getLatestMessageInformation,
};
