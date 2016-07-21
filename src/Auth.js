import Rebridge from "rebridge";

var db = new Rebridge();

export default class Auth {
    static init() {
        if (!db.mods) {
            db.mods = [];
            db.admins = [];
        }
    }

    static isMod(ID) {
        if (Auth.isAdmin(ID)) return true;
        return Auth.mods.indexOf(ID) !== -1;
    }

    static isAdmin(ID) {
        return Auth.admins.indexOf(ID) !== -1;
    }

    static get mods() {
        // Return a clone, because Rebridge doesn't support everything
        return db.mods.slice(0);
    }

    static get admins() {
        // Return a clone, because Rebridge doesn't support everything
        return db.admins.slice(0);
    }
}