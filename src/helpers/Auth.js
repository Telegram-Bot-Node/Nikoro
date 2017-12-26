const fs = require("fs");
const assert = require("assert");

// https://stackoverflow.com/a/1584377
Array.prototype.unique = function() {
    const a = this.concat();
    for (let i = 0; i < a.length; ++i) {
        for (let j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

module.exports = class Auth {
    constructor(config, logger) {
        try {
            const data = fs.readFileSync("./db/helper_Auth.json", "utf-8");
            this.db = JSON.parse(data);
            this.db._owners = this.db._owners.concat(config.owners).unique();
        } catch (err) {
            logger.warn(err);
            logger.warn("No auth db found, or an error occurred while reading it. Generating an empty one.");
            this.db = {
                auth: {},
                _owners: config.owners
            };
        }
    }

    synchronize() {
        fs.writeFile(
            "./db/helper_Auth.json",
            JSON.stringify(this.db),
            err => {
                if (err) throw err;
            }
        );
    }

    isChatAdmin(_userId, _chatId) {
        const userId = Number(_userId);
        assert(isFinite(userId));
        assert(!isNaN(userId));
        const chatId = Number(_chatId);
        assert(isFinite(chatId));
        assert(!isNaN(chatId));

        return this.isOwner(userId) || this.getChatAdmins(chatId).includes(userId);
    }

    isOwner(_userId) {
        const userId = Number(_userId);
        assert(isFinite(userId));
        assert(!isNaN(userId));
        return this.getOwners().includes(userId);
    }

    addChatAdmin(_userId, _chatId) {
        const userId = Number(_userId);
        assert(isFinite(userId));
        assert(!isNaN(userId));
        const chatId = Number(_chatId);
        assert(isFinite(chatId));
        assert(!isNaN(chatId));
        if (!this.db.auth[chatId])
            this.db.auth[chatId] = {};

        if (!this.db.auth[chatId].admins)
            this.db.auth[chatId].admins = [];

        this.db.auth[chatId].admins.push(userId);
        this.synchronize();
    }

    removeChatAdmin(_userId, _chatId) {
        const userId = Number(_userId);
        assert(isFinite(userId));
        assert(!isNaN(userId));
        const chatId = Number(_chatId);
        assert(isFinite(chatId));
        assert(!isNaN(chatId));
        if (!this.db.auth[chatId])
            this.db.auth[chatId] = {};

        if (!this.db.auth[chatId].admins)
            this.db.auth[chatId].admins = [];

        this.db.auth[chatId].admins = this.db.auth[chatId].admins.filter(admin => admin !== userId);
        this.synchronize();
    }

    addOwner(_userId) {
        const userId = Number(_userId);
        assert(isFinite(userId));
        assert(!isNaN(userId));
        if (!this.db._owners)
            this.db._owners = [];

        this.db._owners.push(userId);
        this.synchronize();
    }

    getChatAdmins(_chatId) {
        const chatId = Number(_chatId);
        assert(isFinite(chatId));
        assert(!isNaN(chatId));
        if (this.db.auth[chatId] && this.db.auth[chatId].admins) {
            return this.db.auth[chatId].admins;
        }
        return [];
    }

    getOwners() {
        if (this.db._owners) {
            return this.db._owners;
        }
        return [];
    }
};