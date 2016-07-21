import Plugin from "./../Plugin";
import Rebridge from "rebridge";

var db = Rebridge();

export default class LoggerProxy extends Plugin {
    get plugin() {
        return {
            name: "Ignore",
            description: "Ignore users",
            help: "Syntax: /ignore <username>",
            isProxy: true
        };
    }

	proxy(eventName, message) {
		return new Promise(function(resolve, reject) {
			if (message.from.username) {
	            if (!db["chat" + message.chat.id])
	                db["chat" + message.chat.id] = {};
	            db["chat" + message.chat.id]["ID_" + message.from.username] = message.from.id;
	        }
	        // Register people who join or leave, too.
	        if (message.new_chat_participant || message.left_chat_participant) {
	            const source = message.new_chat_participant ?
	                message.new_chat_participant :
	                message.left_chat_participant;
	            if (!db["chat" + message.chat.id])
	                db["chat" + message.chat.id] = {};
	            db["chat" + message.chat.id]["ID_" + source.username] = source.id;
	        }
	        resolve(message);
		})
	}
}