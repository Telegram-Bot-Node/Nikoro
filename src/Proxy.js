// This is called on every message. It can reject a message, or transform it, or let it through.

export default class MessageProxy {
	lastMessage = {}
	spamInterval = 1000

	sniff(message, eventName) {
		// Types that represent "actual" data and not events
		const message_types = ["text","audio","document","photo","sticker","video","voice","contact","location"];
		// Let events through
		if (message_types.indexOf(eventName) == -1) return Promise.resolve(message);

		const now = (new Date()).getTime();
		const author = message.from.id;
		var rejected = false;
		const lastMessage = this.lastMessage[author];
		// The difference is in milliseconds.
		if (lastMessage && ((now - lastMessage) < this.spamInterval))
			rejected = true;

		this.lastMessage[author] = now;
		if (rejected)
			return Promise.reject();
		else
			return Promise.resolve(message);
	}
}