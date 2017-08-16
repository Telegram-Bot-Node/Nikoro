const fs = require("fs");

let db;

function synchronize() {
    fs.writeFile(
        "./helper_Auth.json",
        JSON.stringify(db),
        err => {
            if (err) throw err;
        }
    );
}

module.exports = class Auth {
    constructor(config) {
        fs.readFile("./helper_Auth.json", (err, data) => {
            if (err) {
                this.db = {
                    auth: {
                        _globalAdmins: config.globalAdmins
                    }
                };
            } else {
                this.db = JSON.parse(data);
            }
        });
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
        synchronize();
    }

    removeAdmin(userId, chatId) {
        if (!this.db.auth[chatId])
            this.db.auth[chatId] = {};

        if (!this.db.auth[chatId].admins)
            this.db.auth[chatId].admins = [];

        this.db.auth[chatId].admins = this.db.auth[chatId].admins.filter(admin => admin !== userId);
        synchronize();
    }

    addMod(userId, chatId) {
        if (!this.db.auth[chatId])
            this.db.auth[chatId] = {};

        if (!this.db.auth[chatId].mods)
            this.db.auth[chatId].mods = [];

        this.db.auth[chatId].mods.push(userId);
        synchronize();
    }

    removeMod(userId, chatId) {
        if (!this.db.auth[chatId])
            this.db.auth[chatId] = {};

        if (!this.db.auth[chatId].mods)
            this.db.auth[chatId].mods = [];

        this.db.auth[chatId].mods = this.db.auth[chatId].mods.filter(mod => mod !== userId);
        synchronize();
    }

    addGlobalAdmin(userId) {
        if (!this.db.this._globalAdmins)
            this.db.this._globalAdmins = [];

        this.db.this._globalAdmins.push(userId);
        synchronize();
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
        if (this.db.this._globalAdmins) {
            return this.db.this._globalAdmins;
        }
        return [];
    }
};