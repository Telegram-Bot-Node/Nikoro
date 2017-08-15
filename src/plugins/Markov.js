const Plugin = require("./../Plugin");

function arraySample(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

class Blather {
    constructor({
        isStart = (key, index) => index === 0,
        clean = textArray => textArray.join(' '),
        split = text => text.split(/\s+/),
        depth = 2,
        joiner = "<|>",
        dictionary = {starts: [], chains: {}}
    }) {
        this.isStart = isStart;
        this.clean = clean;
        this.split = split;
        this.depth = depth;
        this.joiner = joiner;
        this.dictionary = dictionary;
    }

    addFragment(text) {
        const tokens = this.split(text);
        const limit = tokens.length - 1 - this.depth;
        for (let i = 0; i < tokens.length; i++) {
            if (i > limit) return;

            const key = tokens.slice(i, i + this.depth).join(this.joiner);

            if (this.isStart(key, i))
                this.dictionary.starts.push(key);

            this.dictionary.chains[key] = this.dictionary.chains[key] || [];
            this.dictionary.chains[key].push(tokens[i + this.depth]);
        }
    }

    // start is an array of words with which to start
    generateFragment(start = arraySample(this.dictionary.starts).split(this.joiner)) {
        return this.fill(start, this.shouldStopFragment);
    }

    fill(chain, stopCondition) {
        let key = chain.slice(chain.length - this.depth).join(this.joiner);

        while (this.dictionary.chains[key] && !stopCondition(chain)) {
            chain.push(arraySample(this.dictionary.chains[key]));
            key = chain.slice(chain.length - this.depth).join(this.joiner);
        }

        return this.clean(chain);
    }

    stringify() {
        return JSON.stringify({
            depth: this.depth,
            joiner: this.joiner,
            dictionary: this.dictionary
        });
    }

    shouldStopFragment(chain) {
        return chain.length >= 1000;
    }

    static destringify(stringified) {
        return new Blather(JSON.parse(stringified));
    }
}

module.exports = class Markov extends Plugin {

    static get plugin() {
        return {
            name: "Markov",
            description: "Generates random text.",
            help: "/markov, or `/markov <seed>`",
            needs: {
                database: true
            }
        };
    }

    start() {
        if (this.db) {
            this.m = Blather.destringify(JSON.stringify(this.db));
        } else {
            this.m = new Blather();
        }
        this.rate = 0.02;
    }

    onText(message, reply) {
        // Take advantage of this to sync the db to memory
        this.db = {
            depth: this.m.depth,
            joiner: this.m.joiner,
            dictionary: this.m.dictionary
        };

        this.m.addFragment(message.text);
        if (Math.random() > this.rate) return;
        reply({
            type: "text",
            text: this.m.generateFragment()
        });
    }

    onCommand({message, command, args}, reply) {
        if (command !== "markov") return;
        reply({
            type: "text",
            text: this.m.generateFragment((args.length > 0) ? args : undefined)
        });
    }
};