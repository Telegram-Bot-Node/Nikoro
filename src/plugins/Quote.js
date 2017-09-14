// Author: Cristian Achille
// Date: 19-10-2016

const Plugin = require("../Plugin");

module.exports = class Quote extends Plugin {

    static get plugin() {
        return {
            name: 'Quote',
            description: 'A classic quote system',
            help: ` commands: 
                \`/addquote\` adds the replied message 
                \`/quote <id>\` returns the quote by ID
                \`/quote\` returns a random quote`
        };
    }

    start() {
        if (!this.db.quotes)
            this.db.quotes = [];
    }

    onCommand({message, command, args}) {
        switch (command) {
        case "addquote":
            const out = this.addQuote(message);
            this.sendMessage(message.chat.id, out);
            return;
        case "quote":
            const quote = args[0] ? this.findQuote(args[0] - 1) : this.randomQuote();
            this.sendMessage(message.chat.id, quote);
            return;
        default:
            return;
        }
    }

    addQuote(message) {
        if (message.reply_to_message === undefined ||
                message.reply_to_message.text === undefined) {
            return "Please reply to a text message first";
        }

        const author = this.getAuthor(message.reply_to_message);
        const text = message.reply_to_message.text;

        this.db.quotes.push({
            author,
            text
        });

        return `Quote added with ID ${this.db.quotes.length}`;
    }

    findQuote(id) {
        const quote = this.db.quotes[id];
        if (!quote)
            return "Quote not found";

        return `<${quote.author}>: ${quote.text}`;
    }

    randomQuote(reply) {
        const id = Math.floor(Math.random() * this.db.quotes.length);
        return this.findQuote(id, reply);
    }

    getAuthor(obj) {
        let author = obj.from.username;
        const forward = obj.forward_from;
        if (author)
            author = "@" + author;
        else
            author = obj.from.first_name;

        if (forward) {
            if (forward.username)
                author = forward.first_name;
            author = "@" + forward.username;
        }

        return author;
    }
};
