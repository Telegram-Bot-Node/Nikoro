const Plugin = require("./../Plugin");

const PREFIX = "spoiler "; // So as not to pick up callback queries from another plugin
const prefixRegex = /^spoiler /;

module.exports = class Spoiler extends Plugin {
    static get plugin() {
        return {
            name: "Spoiler",
            description: "Use this plugin to send spoilers!",
            help: "This is an inline plugin. Type the bot's username, followed by \"spoiler <your text>\". You can hide only *parts of the message* enclosing them in asterisks.\n\nFor instance, \"@bot spoiler The protagonist *dies in the fourth season*.\""
        };
    }

    onInlineCommand({message, command, args}) {
        if (command !== "spoiler") return;
        if (args.length === 0) {
            const usage = "@bot spoiler The protagonist *dies in the fourth season*.";
            this.answerInlineQuery(message.id, [
                {id: "0", type: "article", title: "Usage", description: usage, message_text: "Usage: " + usage}
            ]);
            return;
        }
        const text = args.join(" ");
        const spoilerRegex = /\*[^\*]+\*/g;

        this.answerInlineQuery(message.id, [
            {
                id: "0",
                type: "article",
                title: "Send spoiler",
                message_text: spoilerRegex.test(text) ? text.replace(/\*[^\*]+\*/g, "SPOILER") : "SPOILER",
                reply_markup: { inline_keyboard: [[{
                    text: "Reveal spoiler",
                    callback_data: "spoiler " + text.replace(/\*/g, "")
                }]]}
            },
        ]);
    }

    onCallbackQuery({message}) {
        if (!prefixRegex.test(message.data))
            return;
        this.answerCallbackQuery({
            callback_query_id: message.id,
            text: message.data.replace(prefixRegex, ""),
            show_alert: true,
            cache_time: 600
        });
    }
};