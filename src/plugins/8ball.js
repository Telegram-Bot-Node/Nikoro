const Plugin = require("../Plugin");

const choices = [
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes definitely",
    "You may rely on it",
    "As I see it, yes",
    "Most likely",
    "Outlook good",
    "Yes",
    "Signs point to yes",
    "Reply hazy try again",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful"
];

module.exports = class The8Ball extends Plugin {
    static get plugin() {
        return {
            name: "The8Ball",
            description: "Magic 8-Ball!",
            help: "The Magic 8-Ball will give an answer to all your yes-no questions.\n/8ball question"
        };
    }

    onCommand({message, command, args}, reply) {
        if (command !== "8ball") return;
        reply({
            type: "text",
            text: this.choices[Math.floor(Math.random() * choices.length)]
        });
    }
}