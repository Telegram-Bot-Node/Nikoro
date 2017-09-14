const fs = require("fs");

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
        fs.readFile("./db/helper_Auth.json", (err, data) => {
            if (err) {
                this.db = {
                    auth: {},
                    _globalAdmins: config.globalAdmins
                };
            } else {
                this.db = JSON.parse(data);
                this.db._globalAdmins = this.db._globalAdmins.concat(config.globalAdmins).unique();
            }
        });
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

    isMod(userId, chatId) {
        if (this.isAdmin(userId, chatId)) {
            return true;
        }
        return this.getMods(chatId).includes(userId);
    }

    isAdmin(userId, chatId) {
        if (this.isGlobalAdmin(userId)) {
            return true;
        }
        return this.getAdmins(chatId).includes(userId);
    }

    isGlobalAdmin(userId) {
        return this.getGlobalAdmins().includes(userId);
    }

    addAdmin(userId, chatId) {
        if (!this.db.auth[chatId])
            this.db.auth[chatId] = {};

        if (!this.db.auth[chatId].admins)
            this.db.auth[chatId].admins = [];

        this.db.auth[chatId].admins.push(userId);
        this.synchronize();
    }

    removeAdmin(userId, chatId) {
        if (!this.db.auth[chatId])
            this.db.auth[chatId] = {};

        if (!this.db.auth[chatId].admins)
            this.db.auth[chatId].admins = [];

        this.db.auth[chatId].admins = this.db.auth[chatId].admins.filter(admin => admin !== userId);
        this.synchronize();
    }

    addMod(userId, chatId) {
        if (!this.db.auth[chatId])
            this.db.auth[chatId] = {};

        if (!this.db.auth[chatId].mods)
            this.db.auth[chatId].mods = [];

        this.db.auth[chatId].mods.push(userId);
        this.synchronize();
    }

    removeMod(userId, chatId) {
        if (!this.db.auth[chatId])
            this.db.auth[chatId] = {};

        if (!this.db.auth[chatId].mods)
            this.db.auth[chatId].mods = [];

        this.db.auth[chatId].mods = this.db.auth[chatId].mods.filter(mod => mod !== userId);
        this.synchronize();
    }

    addGlobalAdmin(userId) {
        if (!this.db._globalAdmins)
            this.db._globalAdmins = [];

        this.db._globalAdmins.push(userId);
        this.synchronize();
    }

    getMods(chatId) {
        if (this.db.auth[chatId] && this.db.auth[chatId].mods) {
            return this.db.auth[chatId].mods;
        }
        return [];
    }

    getAdmins(chatId) {
        if (this.db.auth[chatId] && this.db.auth[chatId].admins) {
            return this.db.auth[chatId].admins;
        }
        return [];
    }

    getGlobalAdmins() {
        if (this.db._globalAdmins) {
            return this.db._globalAdmins;
        }
        return [];
    }
};