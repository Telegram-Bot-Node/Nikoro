import Plugin from "./../Plugin";

export default class Reverse extends Plugin {

    static get plugin() {
        return {
            name: "Reverse",
            description: "Reverses inline messages."
        };
    }

    onInlineCommand({message, command, args}, reply) {
        if (command !== "reverse") return;
        const text = args.join(" ").split("").reverse().join("");
        reply({
            type: "inline",
            results: [
                {
                    type: "article",
                    id: "1",
                    title: text,
                    input_message_content: {
                        message_text: text
                    }
                }
            ]
        });
    }
}