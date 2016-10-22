const fs = require("fs");
const Config = JSON.parse(require("fs").readFileSync("./config.json", "utf8"));

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

export default class Auth {

    static init() {
        fs.readFile("./helper_Auth.json", (err, data) => {
            if (err) {
                db = {
                    auth: {
                        _globalAdmins: Config.globalAdmins
                    }
                };
            } else {
                db = JSON.parse(data);
            }
        });
    }

    static isMod(userId, chatId) {
        if (Auth.isAdmin(userId, chatId)) {
            return true;
        }
        return Auth.getMods(chatId).indexOf(userId) !== -1;
    }

    static isAdmin(userId, chatId) {
        if (Auth.isGlobalAdmin(userId)) {
            return true;
        }
        return Auth.getAdmins(chatId).indexOf(userId) !== -1;
    }

    static isGlobalAdmin(userId) {
        return Auth.getGlobalAdmins().indexOf(userId) !== -1;
    }

    static addAdmin(userId, chatId) {
        if (!db.auth[chatId])
            db.auth[chatId] = {};

        if (!db.auth[chatId].admins)
            db.auth[chatId].admins = [];

        db.auth[chatId].admins.push(userId);
        synchronize();
    }

    static removeAdmin(userId, chatId) {
        if (!db.auth[chatId])
            db.auth[chatId] = {};

        if (!db.auth[chatId].admins)
            db.auth[chatId].admins = [];

        db.auth[chatId].admins = db.auth[chatId].admins.filter(admin => admin !== userId);
        synchronize();
    }

    static addMod(userId, chatId) {
        if (!db.auth[chatId])
            db.auth[chatId] = {};

        if (!db.auth[chatId].mods)
            db.auth[chatId].mods = [];

        db.auth[chatId].mods.push(userId);
        synchronize();
    }

    static removeMod(userId, chatId) {
        if (!db.auth[chatId])
            db.auth[chatId] = {};

        if (!db.auth[chatId].mods)
            db.auth[chatId].mods = [];

        db.auth[chatId].mods = db.auth[chatId].mods.filter(mod => mod !== userId);
        synchronize();
    }

    static addGlobalAdmin(userId) {
        if (!db.auth._globalAdmins)
            db.auth._globalAdmins = [];

        db.auth._globalAdmins.push(userId);
        synchronize();
    }

    static getMods(chatId) {
        if (db.auth[chatId] && db.auth[chatId].mods) {
            return db.auth[chatId].mods;
        }
        return [];
    }

    static getAdmins(chatId) {
        if (db.auth[chatId] && db.auth[chatId].admins) {
            return db.auth[chatId].admins;
        }
        return [];
    }

    static getGlobalAdmins() {
        if (db.auth._globalAdmins) {
            return db.auth._globalAdmins;
        }
        return [];
    }
}