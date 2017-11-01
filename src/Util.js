/* eslint no-warning-comments:0 */

/*
    Util
    A module which collects a few useful functions
    which could be used when developing plugins
*/

const request = require("request");
const fs = require("fs");
const Logger = require("./Log");
const log = new Logger("Util", {loggingLevel: "info"}); // todo: figure out how to manage this

// Because of architectural reasons, this is a thin wrapper around UserInfo
class NameResolver {
    // This function is called ONLY by the UserInfo plugin to pass its db
    setDb(db) {
        log.verbose("Name resolution database initialized.");
        this.db = db;
    }

    // For a given username, retrieve the user ID.
    getUserIDFromUsername(username) {
        username = username.replace(/^@/, "");
        if (!this.db) {
            log.error("NameResolver: database is uninitialized");
            throw new Error("Database uninitialized");
        }
        return this.db[username];
    }

    // For a given user ID, get username(s)
    getUsernamesFromUserID(userID) {
        if (!this.db) {
            log.error("NameResolver: database is uninitialized");
            throw new Error("Database uninitialized");
        }
        return Object.keys(this.db).filter(username => this.db[username] === userID);
    }
}

const nameResolver = new NameResolver();

/* Makes it possible to run commands (eg. /ignore) both as "/ignore username", "/ignore ID",
 * or replying "/ignore" to a message sent by @username.
 */
function getTargetID(message, args, commandName = "command") {
    if (args.length === 1) {
        if (/^\d+$/.test(args[0])) {
            return Number(args[0]);
        }
        if (/^@[a-z0-9_]+$/i.test(args[0])) { // Attempt to resolve username
            try {
                const target = Number(nameResolver.getUserIDFromUsername(args[0]));
                if (!target)
                    return "I've never seen that username.";
                return target;
            } catch (e) {
                return "Couldn't resolve username. Did you /enable UserInfo?";
            }
        }
        return "Syntax: `/" + commandName + " <ID/username>`";
    }
    if (message.reply_to_message) {
        if (message.reply_to_message.new_chat_participant)
            return message.reply_to_message.new_chat_participant.id;
        if (message.reply_to_message.left_chat_participant)
            return message.reply_to_message.left_chat_participant.id;
        return message.reply_to_message.from.id;
    }
    return "Syntax: `/" + commandName + " <ID/username>`";
}

function escapeRegExp(str) {
    log.debug(`Escaping RegExp: ${str}`);
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

// http://stackoverflow.com/a/2117523
function makeUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }
    );
}

// `callback` receives the temporary path (eg. /tmp/notavirus.exe).
function downloadAndSaveTempResource(url, extension, callback) {
    log.info(`Downloading and saving resource from ${url}`);

    const fn = `/tmp/${makeUUID()}.${extension}`;

    request({
        url,
        headers: {
            "User-Agent": "stagefright/1.2 (Linux;Android 5.0)"
        }
    })
    .pipe(fs.createWriteStream(fn))
    .on("close", () => callback(fn));
}

function buildPrettyUserName(user) {
    let name = "";

    if (user.first_name) name += user.first_name + " ";

    if (user.last_name) name += user.last_name + " ";

    if (user.username) name += `@${user.username} `;

    if (user.id) name += `[${user.id}] `;

    return name.trim();
}

function buildPrettyChatName(chat) {
    let name = "";

    if (chat.title) name += chat.title + " ";

    if (chat.username) name += `@${chat.username} `;

    if (chat.first_name) name += chat.first_name + " ";

    if (chat.last_name) name += chat.last_name + " ";

    if (chat.type) name += `(${chat.type}) `;

    if (chat.id) name += `[${chat.id}] `;

    return name.trim();
}

function makeHTMLLink(title, url) {
    const sanitize = str => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // We don't really care about other characters, but '"' may close the href string.
    if (url.includes('"'))
        throw new Error("Invalid link");
    return `<a href="${url}">${sanitize(title)}</a>`;
}

module.exports = {
    nameResolver,
    getTargetID,
    escapeRegExp,
    makeUUID,
    downloadAndSaveTempResource,
    buildPrettyUserName,
    buildPrettyChatName,
    makeHTMLLink
};