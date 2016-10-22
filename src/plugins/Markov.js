import Plugin from "./../Plugin";
import markov from "blather";

var m = markov();
const rate = 0;

export default class Markov extends Plugin {

    static get plugin() {
        return {
            name: "Markov",
            description: "Generates random text."
        };
    }

    onText(message, reply) {
        if (message.text !== "/m")
            m.addFragment(message.text);
        if (Math.random() > rate) return;
        reply({
            type: "text",
            text: m.generateFragment()
        });
    }
}