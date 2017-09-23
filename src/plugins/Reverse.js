const Plugin = require("./../Plugin");

module.exports = class Reverse extends Plugin {

    static get plugin() {
        return {
            name: "Reverse",
            description: "Reverses inline messages."
        };
    }

    onInlineCommand({message, command, args}) {
        if (command !== "reverse") return;
        const text = args.join(" ").split("").reverse().join("");
        this.answerInlineQuery(message.id, [{
            type: "article",
            id: "1",
            title: text,
            input_message_content: {
                message_text: text
            }
        }]);
    }
};