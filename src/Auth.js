import Plugin from "./../Plugin";
import Rebridge from "rebridge";

var db = new Rebridge();

export default class Auth {
    isMod(ID) {
        return this.mods.indexOf(ID) !== -1;
    }

    isAdmin(ID) {
        return this.admins.indexOf(ID) !== -1;
    }

    get mods() {
        // Return a clone, because Rebridge doesn't support everything
        return db.mods.slice(0);
    }

    get admins() {
        // Return a clone, because Rebridge doesn't support everything
        return db.admins.slice(0);
    }
}