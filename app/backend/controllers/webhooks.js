'use strict';

/*
 * CONTROLLER: Webhooks
 */

const { parseLatestMessageInformation } = require(`../modules/utilities`);

module.exports = class WebhooksController {

	/*
	 * Instantiate the controller.
	 */
	constructor (socketServer) {
		this.socketServer = socketServer;
	}

	/*
	 * Emits new messages to the client.
	 */
	newMessage (req, res) {

		const userId = req.body.userId;
		const message = req.body.message;
		const latestMessage = parseLatestMessageInformation(message);

		// Alert all clients to this incoming message.
		this.socketServer.emit(`messaging/thread/new-message`, {
			thread: {
				itemId: userId,
				latestMessage,
				latestDate: message.sentAt,
			},
			message: {
				itemId: message.messageId,
				direction: message.direction,
				sentAt: message.sentAt,
				humanToHuman: message.humanToHuman,
				data: message,
			},
		});

		return res.json({
			success: true,
		});

	}

	/*
	 * Emits memory changes to the client.
 	 */
	memoryChange (req, res) {

		const userId = req.body.userId;
		const memory = req.body.memory;

		// Alert all clients to this incoming message.
		this.socketServer.emit(`messaging/thread/memory-change`, {
			thread: {
				itemId: userId,
			},
			memory: {
				key: memory.key,
				newValue: memory.newValue,
			},
		});

		return res.json({
			success: true,
		});

	}

};
