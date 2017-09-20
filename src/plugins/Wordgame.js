const Plugin = require("./../Plugin");

const wordlist = require("fs").readFileSync(require("word-list"), "utf8").split("\n");

function getRandomWord() {
    return wordlist[Math.floor(Math.random() * wordlist.length)];
}

// https://stackoverflow.com/a/12646864
function shuffleWord(word) {
    const array = word.split("");
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join("");
}

module.exports = class Wordgame extends Plugin {
    static get plugin() {
        return {
            name: "Wordgame",
            description: "Some word games.",
            help: "Try /type or /anagram."
        };
    }

    get commands() { return {
        cancel: () => {
            this.state = "";
            return "Done.";
        },
        anagram: () => {
            if (this.state) return "Another game is already running, use /cancel to stop it";
            this.state = "type";
            this.word = getRandomWord();
            return `What's the anagram of "${shuffleWord(this.word)}"?`;
        },
        type: () => {
            if (this.state) return "Another game is already running, use /cancel to stop it";
            this.state = "type";
            this.word = getRandomWord();
            return `Type "${this.word}"!`;
        }
    };}

    onText({message}, reply) {
        if (this.state === "") return;
        if (message.text !== this.word) return;
        this.state = "";
        reply({
            type: "text",
            text: `Well done, @${message.from.username}!`
        });
    }
};
