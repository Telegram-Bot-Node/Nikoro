// Author: Cristian Achille
// Date: 19-10-2016

import Plugin from '../Plugin';

export default class Quote extends Plugin {

    static get plugin() {
        return {
            name: 'Quote',
            description: 'A classic quote system',
            help: ` commands: 
                \`/addquote\` adds the replied message 
                \`/quote <id>\` returns the quote by ID
                \`/quote\` returns a random quote`,
            needs: {
                database: true
            }
        };
    }

    client = null;
    KEY = 'plugin_quote'

    start() {
        if (!this.db.quotes)
            this.db.quotes = [];
    }

    onCommand({message, command, args}, reply) {
        switch (command) {
        case "addquote":
            this.addQuote(message, reply);
            return;
        case "quote":
            if (args[0])
                this.findQuote(args[0] - 1, reply);
            else
                this.randomQuote(reply);
            return;
        default:
            return;
        }
    }

    addQuote(message, reply) {
        if (message.reply_to_message === undefined ||
                message.reply_to_message.text === undefined) {
            reply({type: 'text', text: 'Please reply to a text message first'});
            return;
        }

        const author = this.getAuthor(message.reply_to_message);
        const text = message.reply_to_message.text;

        this.db.quotes.push({
            author,
            text
        });

        reply({type: 'text', text: `Quote added with ID ${this.db.quotes.length}`});
    }

    findQuote(id, reply) {
        const quote = this.db.quotes[id];
        if (!quote)
            return reply({type: 'text', text: "Quote not found"});

        reply({type: 'text', text: `<${quote.author}>: ${quote.text}`});
    }

    randomQuote(reply) {
        const id = Math.floor(Math.random() * this.db.quotes.length);
        this.findQuote(id, reply);
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
}
