const Plugin = require("./../Plugin");
const Util = require("./../Util");
const Scheduler = require("./../helpers/Scheduler.js");
const Parser = require("rss-parser");

async function getFeedItems(URL) {
    const parser = new Parser();
    const feed = await parser.parseURL(URL);
    return feed.items;
}

module.exports = class RSS extends Plugin {
    static get plugin() {
        return {
            name: "RSS",
            description: "Read RSS feeds",
            help: `/addrss to add an RSS feed
/deleterss to delete it
/rsslist to list RSS feeds
/rss to fetch and print news from the feeds
/rsstime to set when to automatically print news (eg. /rsstime 10:00, must use 24-hour format)`
        };
    }

    constructor(obj) {
        super(obj);

        this.auth = obj.auth;
        Scheduler.on("RSSTrigger", ({chatID}) => this.printRSS(chatID));
    }

    onCommand({message, command, args}) {
        const chatID = message.chat.id;
        switch (command) {
            case "rsslist": {
                const entry = this.db[chatID];
                if (!entry)
                    return "None.";
                return `At ${entry.time}:\n\n` + (entry.feeds.join("\n") || "None.");
            }
            case "addrss": {
                if (!this.auth.isChatAdmin(message.from.id, chatID))
                    return "Insufficient privileges (chat admin required).";
                if (args.length != 1)
                    return "Syntax: /addrss http://example.com/feed.xml"
                const URL = args[0];
                if (!this.db[chatID])
                    this.db[chatID] = {
                        feeds: [],
                        time: "12:00"
                    };
                this.db[chatID].feeds.push(URL);
                return `Added ${URL}.`;
            }
            case "deleterss": {
                if (!this.auth.isChatAdmin(message.from.id, chatID))
                    return "Insufficient privileges (chat admin required).";
                if (args.length != 1)
                    return "Syntax: /deleterss http://example.com/feed.xml"
                const URL = args[0];
                if (!this.db[chatID])
                    this.db[chatID] = {
                        feeds: [],
                        time: "12:00"
                    };
                this.db[chatID].feeds.filter(it => it !== URL);
                return `Deleted ${URL}.`;
            }
            case "rss": {
                if (!this.auth.isChatAdmin(message.from.id, chatID))
                    return "Insufficient privileges (chat admin required).";
                if (!this.db[chatID].feeds)
                    return "No RSS feeds set for this chat.";
                this.printRSS(chatID);
                break;
            }
            case "rsstime": {
                if (!this.auth.isChatAdmin(message.from.id, chatID))
                    return "Insufficient privileges (chat admin required).";
                if (args.length != 1)
                    return "Syntax: /rsstime time (eg. /rsstime 12:00). Must use the 24-hour format."
                const time = args[0];
                if (!/^[012]\d:[0-5]\d$/.test(time))
                    return "Syntax: /rsstime time (eg. /rsstime 12:00). Must use the 24-hour format."
                const [hh, mm] = time.match(/^([012]\d):([0-5]\d)$/).slice(1);
                if (!this.db[chatID])
                    this.db[chatID] = {
                        feeds: [],
                        time: hh + ":" + mm
                    };
                else
                    this.db[chatID].time = hh + ":" + mm;
                Scheduler.cancel(it => it.plugin === "RSS" && it.chatID === chatID);
                Scheduler.scheduleCron("RSSTrigger", {plugin: "RSS", chatID}, `00 ${mm} ${hh} * * *`);
                return `I will print RSS feeds every day at ${hh}:${mm}.`;
            }
        }
    }

    async printRSS(chatID) {
        console.log("Printing!");
        console.log(this.db);
        const itemArrays = await Promise.all(this.db[chatID].feeds.map(getFeedItems));
        console.log(itemArrays);
        await itemArrays.forEach(itemArray => {
            if (itemArray) {
                let i = 1;
                const text = itemArray.map(item => `${i++}. ` + Util.makeHTMLLink(item.title, item.link)).join("\n");
                console.log(text);
                this.sendMessage(
                    chatID,
                    text,
                    {
                        parse_mode: "HTML"
                    });
            }
        });
    }
};