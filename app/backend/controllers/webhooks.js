'use strict';

/*
 * CONTROLLER: Webhooks
 */

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

		// Alert all clients to this incoming message.
		this.socketServer.emit(`thread/new-message`, {
			threadId: userId,
			message: {
				messageId: message.messageId,
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

};
