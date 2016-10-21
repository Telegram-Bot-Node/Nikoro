// Author: Cristian Achille
// Date: 19-10-2016

import Plugin from '../Plugin';
import Util from '../Util';
import redis from 'redis';

export default class QuoteSystem extends Plugin {

    static get plugin() {
        return {
            name: 'QuoteSystem',
            description: 'A classic Quote system such as the famous one for eggdrop',
            help: '...'
        };
    }

    client = null;
    KEY = 'plugin_quote'

    start() {
        this.client = redis.createClient();
    }

    onText(message, reply) {
        let parts = Util.parseCommand(message.text, ['addquote', 'quote']);
        if (parts !== null) {
            if (parts[0] === 'addquote') {
                let result = this.addQuote(message, reply);
                if (result === -1)
                    reply({type: 'text', text: 'Quote added ID is ' + result.toString()});
            } else if (parts[0] === 'quote') {
                if (parts[1] === undefined) {
                    this.randomQuote(reply);
                } else {
                    this.findQuote(parts[1], reply);
                }
            }
        }
    }

    addQuote(message, reply) {
        this.client.hincrby(this.KEY, ['count', 1], (err, obj) => {
            this.client.hget(this.KEY, ['count'], (err, obj) => {
                if (message.reply_to_message == undefined) {
                    if (message.reply_to_message.text == undefined) {
                        reply({type: 'text', text: 'Please reply to a text message first'});
                        return -1;
                    }
                }

                let count = obj;
                let author = message.reply_to_message.from.username;
                let quote = message.reply_to_message.text;

                this.client.hmset(this.KEY, [count + 'by', author, count + 'quote', quote]);
                return count;
            });
        });
    }

    findQuote(id, reply) {
        this.client.hget(this.KEY, [id + 'by'], (err, obj) => {
            let username = obj;
            this.client.hget(this.KEY, [id + 'quote'], (err, obj) => {
                let quote = obj;
                reply({type: 'text', text: '<@' + username + '> : ' + quote});
            });
        });
    }

    randomQuote(reply) {
        this.client.hget(this.KEY, ['count'], (err, obj) => {
            let id = Math.floor(Math.random() * obj) + 1;
            this.findQuote(id, reply);
        });
    }
}
