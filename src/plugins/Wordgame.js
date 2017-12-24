const Plugin = require("./../Plugin");

const wordlist = Object.values(require("diceware-wordlist-en-eff"));

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

    onCommand({command}) {
        switch (command) {
            case "cancel":
                this.state = "";
                return "Done.";
            case "anagram":
                if (this.state) return "Another game is already running, use /cancel to stop it";
                this.state = "type";
                this.word = getRandomWord();
                return `What's the anagram of "${shuffleWord(this.word)}"?`;
            case "type":
                if (this.state) return "Another game is already running, use /cancel to stop it";
                this.state = "type";
                this.word = getRandomWord();
                return `Type "${this.word}"!`;
        }
    }

    onText({message}) {
        if (this.state === "") return;
        if (message.text !== this.word) return;
        this.state = "";
        return `Well done, @${message.from.username}!`;
    }
};
