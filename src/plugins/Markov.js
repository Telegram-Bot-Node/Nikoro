import Plugin from "./../Plugin";
import Blather from "blather";

export default class Markov extends Plugin {

    static get plugin() {
        return {
            name: "Markov",
            description: "Generates random text.",
            needs: {
                database: true
            }
        };
    }

    m = null;
    rate = 0;

    start() {
        if (this.db) {
            this.m = Blather.destringify(JSON.stringify(this.db));
        } else {
            this.m = new Blather();
        }
    }

    onText(message, reply) {
        if (message.text !== "/markov") {
            this.m.addFragment(message.text);
            if (Math.random() > this.rate) return;
        }
        reply({
            type: "text",
            text: this.m.generateFragment()
        });

        this.db = JSON.parse(this.m.stringify());
    }
}