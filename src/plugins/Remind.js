const Plugin = require("./../Plugin");
const Scheduler = require("./../helpers/Scheduler.js");

module.exports = class Remind extends Plugin {
    static get plugin() {
        return {
            name: "Remind",
            description: "Reminds you of upcoming events.",
            help: ` - '/remind date event' (eg. '/remind 16/01/18 Call Bob', day comes before month)
 - '/remind time event' (eg. '/remind 18:00 Call Bob'. Please use a 24-hour format, not am/pm!)
 - '/remind date time event' (eg. '/remind 16/01/18 18:00 Call Bob'. Please use a 24-hour format, not am/pm!)
 - '/remind delay event' (eg. '/remind 2h30m Call Bob')

Use /remindlist for a list of upcoming events.`
        };
    }

    constructor(obj) {
        super(obj);
        Scheduler.on("reminder", evt => {
            if (evt.plugin !== "Remind") return;
            this.sendMessage(evt.chat, `Time's up: ${evt.text}`);
        });
    }

    onCommand({message, command, args}) {
        switch (command) {
            case "remindlist":
                return Scheduler.events
                    .filter(it => it.metadata.plugin === "Remind")
                    .filter(it => it.metadata.chat === message.chat.id)
                    .map(it => `${it.date.toLocaleString("it-IT")}: ${it.metadata.text}`)
                    .join("\n") || "None.";
            case "remind":
                // To reduce indentation
                return this.remindHandler({message, command, args});
        }
    }

    remindHandler({message, command, args}) {
        if (args.length < 2)
            return "Invalid command (see /help Remind for usage)."
        const delayString = args.shift();
        const now = new Date();
        let date;
        const hourRegex = /^([012]?\d):([012345]\d)$/;
        const dateRegex = /^([0123]\d)[-/]([01]\d)[-/](?:20)?(\d\d)$/;
        if (hourRegex.test(delayString)) {
            const [hours, minutes] = delayString.match(hourRegex).slice(1);
            date = new Date();
            date.setHours(hours, minutes, 0);
        } else if (dateRegex.test(delayString)) {
            const [day, month, year] = delayString.match(dateRegex).slice(1);
            date = new Date();
            date.setFullYear(2000 + Number(year), Number(month) - 1, day);
            if (hourRegex.test(args[0])) {
                const hourString = args.shift();
                const [hours, minutes] = hourString.match(hourRegex).slice(1);
                date = new Date();
                date.setHours(hours, minutes, 0);
            }
        }
        if (date < now)
            return "Can't set events in the past!";
        Scheduler.schedule("reminder", {
            plugin: "Remind",
            chat: message.chat.id,
            text: args.join(" ")
        }, date);
        // Use your own language here!
        // This was made for Italian chat groups, so it uses the Italian localization.
        return `Scheduled for ${date.toLocaleString("it-IT")}.`;
    }
};