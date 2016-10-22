// Author: Cristian Achille
// Date: 19-10-2016

import Plugin from '../Plugin';
import redis from 'redis';

export default class QuoteSystem extends Plugin {

    static get plugin() {
        return {
            name: 'QuoteSystem',
            description: 'A classic Quote system such as the famous one for eggdrop',
            help: ` commands: 
                \`/addquote\` adds the replied message 
                \`/quote <id>\` returns the quote by ID
                \`/quote\` returns a random quote`
        };
    }

    client = null;
    KEY = 'plugin_quote'

    start() {
        this.client = redis.createClient();
    }

    onCommand({message, command, args}, reply) {
        switch (command) {
        case "addquote":
            this.addQuote(message, reply);
            return;
        case "quote":
            if (args[0])
                this.findQuote(args[0], reply);
            else
                this.randomQuote(reply);
            return;
        default:
            return;
        }
    }

    addQuote(message, reply) {
        this.client.hincrby(this.KEY, ['count', 1], err => {
            if (err !== null) {
                this.log.error(err);
                return;
            }
            this.client.hget(this.KEY, ['count'], (err, obj) => {
                if (err !== null) {
                    this.log.error(err);
                    return;
                }
                if (message.reply_to_message === undefined ||
                        message.reply_to_message.text === undefined) {
                    reply({type: 'text', text: 'Please reply to a text message first'});
                    return;
                }

                let count = obj;
                let author = this.getAuthor(message.reply_to_message);
                let quote = message.reply_to_message.text;

                this.client.hmset(this.KEY, [count + 'by', author, count + 'quote', quote]);
                reply({type: 'text', text: 'Quote added, ID is ' + count});
                return;
            });
        });
    }

    findQuote(id, reply) {
        this.client.hget(this.KEY, [id + 'by'], (err, obj) => {
            if (err !== null) {
                this.log.error(err);
                return;
            }

            if (obj) {
                let username = obj;
                this.client.hget(this.KEY, [id + 'quote'], (err, obj) => {
                    if (err !== null) {
                        this.log.error(err);
                        return;
                    }
                    let quote = obj;
                    reply({type: 'text', text: '<' + username + '> : ' + quote});
                    return;
                });
            } else {
                reply({type: 'text', text: "id not found"});
            }
        });
    }

    randomQuote(reply) {
        this.client.hget(this.KEY, ['count'], (err, obj) => {
            if (err !== null) {
                this.log.error(err);
                return;
            }
            let id = Math.floor(Math.random() * obj) + 1;
            this.findQuote(id, reply);
        });
    }

    getAuthor(obj) {
        let author = obj.from.username;
        let forward = obj.forward_from;
        if (author === undefined) {
            author = obj.from.first_name;
        } else {
            author = "@" + author;
        }

        if (forward !== undefined) {
            if (forward.username === undefined)
                author = forward.first_name;
            author = "@" + forward.username;
        }

        return author;
    }
}
