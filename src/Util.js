/*
    Util
    A module which collects a few useful functions
    which could be used when developing plugins
*/

const Util = {};

const request = require("request");
const fs = require("fs");
import Log from "./Log";
const log = Log.get("Util");
const assert = require("assert");

/*
    A bit hacked together but it works.
    Need to finish docs

    What this function consider a valid command:
        * Starts with either ! or /
        * which is followed by the command name
        * which is followed by a series of arguments
            * separeted by space or by what is passed as the splitBy variable

    @param string - The message which you want to extract args from

    @param commandName - The command (string) or commands (array) that will trigger the match.
            string =  "/yahoo text"
            parseCommand(string) ->  ["yahoo","text"]
            parseCommand(string,{commandName: "yahoo"}) ->  ["yahoo","text"]
            parseCommand(string,{commandName: ["yahoo","y"]}) ->  ["y","text"]
            parseCommand(string,{commandName: "google"}) ->  null
                since the string command does not match the command passed as parameter

    @param options - An object that can have different properties specified.

    @param options.splitBy - Optional. The character that divides the parameters of the command,
            Defaults to " " (space) if not set.

    @param options.joinParams - Optional. Join all the parameters into a single string parameter,
            The parameters will be joined with a " " (space)
            Defailts to false if not set.

    @return - An array of the args of the command,
        The first element of the array is the command name. (C / Python style)
        Returns null if the message is not a valid command (does not match the specified commands)
*/

Util.parseCommand = function(string, commandName, {
    overrideDeprecation = false,
    splitBy = " ",
    joinParams = false,
    noRequireTrigger = false
    }) {
    if (!overrideDeprecation) log.warn("Warning: using deprecated utility parseCommand");
    assert.deepEqual(typeof string, "string");

    if (typeof commandName === "string")
        commandName = [commandName];

    // let's build a valid regex that matches any of the passed commands
    // ["g","google","ggl"] -> g|google|ggl
    const regexParam = commandName.join("|");

    let trigger = "";
    if (!noRequireTrigger) trigger = "(?:\\/)";

    const re = new RegExp("^" + trigger + "(" + regexParam + ")\\s+(.*)");

    // We have to add this space because we specified "\s+" in the regex,
    // to separate command from params, if we use "\s*" "!google test" -> ["g","oogle","test"]
    const match = re.exec(string + " ");
    if (!match) return null;

    const command = match[1].trim();
    const args = [command];

    let params = match[2].split(splitBy);

    if (joinParams)
        params = [params.join(" ")];

    for (const param of params) {
        if (param.length === 0) continue;
        args.push(param);
    }

    return args;
};

Util.startsWith = function(string, what) {
    return string.slice(0, what.length) === what;
};

Util.parseInline = function(message, commandName, options = {}) {
    options.noRequireTrigger = true;

    return this.parseCommand(message, commandName, options);
};

Util.escapeRegExp = function(str) {
    log.debug(`Escaping RegExp: ${str}`);
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

// http://stackoverflow.com/a/2117523
Util.makeUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }
);

// `callback` receives the temporary path (eg. /tmp/notavirus.exe).
Util.downloadAndSaveTempResource = function(url, extension, callback) {
    log.info(`Downloading and saving resource from ${url}`);

    const fn = `/tmp/${Util.makeUUID()}.${extension}`;

    request({
        url,
        headers: {
            "User-Agent": "stagefright/1.2 (Linux;Android 5.0)"
        }
    })
    .pipe(fs.createWriteStream(fn))
    .on("close", () => callback(fn));
};

Util.buildPrettyUserName = function(user) {
    let name = "";

    if (user.first_name) name += user.first_name + " ";

    if (user.last_name) name += user.last_name + " ";

    if (user.username) name += `@${user.username} `;

    if (user.id) name += `[${user.id}] `;

    return name.trim();
};

Util.buildPrettyChatName = function(chat) {
    let name = "";

    if (chat.title) name += chat.title + " ";

    if (chat.username) name += `@${chat.username} `;

    if (chat.first_name) name += chat.first_name + " ";

    if (chat.last_name) name += chat.last_name + " ";

    if (chat.type) name += `(${chat.type}) `;

    if (chat.id) name += `[${chat.id}] `;

    return name.trim();
};

module.exports = Util;