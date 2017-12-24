// Author: Cristian Achille
// Date: 19-10-2016

const Plugin = require("../Plugin");

module.exports = class Quote extends Plugin {
    constructor(obj) {
        super(obj);

        if (!this.db.quotes) {
            this.db.quotes = [];
        }
    }

    static get plugin() {
        return {
            name: "Quote",
            description: "A classic quote system",
            help: `Commands:
/addquote adds the message you replied to 
/quote returns a random quote
\`/quote <id>\` returns the quote with the given ID`
        };
    }

    onCommand({command, message, args}) {
        switch (command) {
            case "addquote":
                return this.addQuote(message);
            case "quote":
                if (args[0])
                    return this.findQuote(args[0] - 1);
                return this.randomQuote();
        }
    }

    addQuote(message) {
        if (!message.reply_to_message || !message.reply_to_message.text)
            return "Reply to a text message to add it to the quotes database.";

        const author = Quote.getAuthor(message.reply_to_message);
        const text = message.reply_to_message.text;

        this.db.quotes.push({
            author,
            text
        });

        return `Quote added with ID ${this.db.quotes.length - 1}.`;
    }

    findQuote(id) {
        const quote = this.db.quotes[id];
        if (!quote)
            return "Quote not found!";

        return `<${quote.author}>: ${quote.text}`;
    }

    randomQuote() {
        const id = Math.floor(Math.random() * this.db.quotes.length);
        return this.findQuote(id);
    }

    static getAuthor(obj) {
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
