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
    constructor(config) {
        try {
            const data = fs.readFileSync("./db/helper_Auth.json", "utf-8");
            this.db = JSON.parse(data);
            this.db._owners = this.db._owners.concat(config.owners).unique();
        } catch (err) {
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

    isMod(_userId, _chatId) {
        const userId = Number(_userId);
        assert(isFinite(userId));
        assert(!isNaN(userId));
        const chatId = Number(_chatId);
        assert(isFinite(chatId));
        assert(!isNaN(chatId));
        if (this.isAdmin(userId, chatId)) {
            return true;
        }
        return this.getMods(chatId).includes(userId);
    }

    isAdmin(_userId, _chatId) {
        const userId = Number(_userId);
        assert(isFinite(userId));
        assert(!isNaN(userId));
        const chatId = Number(_chatId);
        assert(isFinite(chatId));
        assert(!isNaN(chatId));

        return this.isOwner(userId) || this.getAdmins(chatId).includes(userId);
    }

    isOwner(_userId) {
        const userId = Number(_userId);
        assert(isFinite(userId));
        assert(!isNaN(userId));
        return this.getOwners().includes(userId);
    }

    addAdmin(_userId, _chatId) {
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

    removeAdmin(_userId, _chatId) {
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

    addMod(_userId, _chatId) {
        const userId = Number(_userId);
        assert(isFinite(userId));
        assert(!isNaN(userId));
        const chatId = Number(_chatId);
        assert(isFinite(chatId));
        assert(!isNaN(chatId));
        if (!this.db.auth[chatId])
            this.db.auth[chatId] = {};

        if (!this.db.auth[chatId].mods)
            this.db.auth[chatId].mods = [];

        this.db.auth[chatId].mods.push(userId);
        this.synchronize();
    }

    removeMod(_userId, _chatId) {
        const userId = Number(_userId);
        assert(isFinite(userId));
        assert(!isNaN(userId));
        const chatId = Number(_chatId);
        assert(isFinite(chatId));
        assert(!isNaN(chatId));
        if (!this.db.auth[chatId])
            this.db.auth[chatId] = {};

        if (!this.db.auth[chatId].mods)
            this.db.auth[chatId].mods = [];

        this.db.auth[chatId].mods = this.db.auth[chatId].mods.filter(mod => mod !== userId);
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

    getMods(_chatId) {
        const chatId = Number(_chatId);
        assert(isFinite(chatId));
        assert(!isNaN(chatId));
        if (this.db.auth[chatId] && this.db.auth[chatId].mods) {
            return this.db.auth[chatId].mods;
        }
        return [];
    }

    getAdmins(_chatId) {
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