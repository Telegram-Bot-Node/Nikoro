import Rebridge from "rebridge";
import Config from "../../Config";

var db = new Rebridge();
/*
db.auth = {
    _globalAdmins: []
    chatId1: {
        mods: []
        admins []
    }
    chatId2: {
        mods: []
        admins: []
    }
}
*/
export default class Auth {

    static init() {
        if (!db.auth) {
            db.auth = {};
        }

        if (!db.auth._globalAdmins) {
            db.auth._globalAdmins = Config.globalAdmins;
        }
    }

    static isMod(userId, chatId) {
        if (Auth.isAdmin(userId, chatId)){
            return true;
        }
        return Auth.getMods(chatId).indexOf(userId) !== -1;
    }

    static isAdmin(userId, chatId) {
        if (Auth.isGlobalAdmin(userId)){
            return true;
        }
        return Auth.getAdmins(chatId).indexOf(userId) !== -1;
    }

    static isGlobalAdmin(userId){
        return Auth.getGlobalAdmins().indexOf(userId) !== -1;
    }


    static addAdmin(userId, chatId){
        if(!db.auth[chatId])
            db.auth[chatId] = {};

        if(!db.auth[chatId].admins)
            db.auth[chatId].admins = [];

        db.auth[chatId].admins.push(userId);
    }

    static removeAdmin(userId, chatId){
        if(!db.auth[chatId])
            db.auth[chatId] = {};

        if(!db.auth[chatId].admins)
            db.auth[chatId].admins = [];

        db.auth[chatId].admins = db.auth[chatId].admins.filter(admin => admin !== userId)
    }

    static addMod(userId, chatId){
        if(!db.auth[chatId])
            db.auth[chatId] = {};

        if(!db.auth[chatId].mods)
            db.auth[chatId].mods = [];

        db.auth[chatId].mods.push(userId);
    }

    static removeMod(userId, chatId){
        if(!db.auth[chatId])
            db.auth[chatId] = {};

        if(!db.auth[chatId].mods)
            db.auth[chatId].mods = [];

        db.auth[chatId].mods = db.auth[chatId].mods.filter(mod => mod !== userId)
    }

    static addGlobalAdmin(userId){
        if(!db.auth._globalAdmins)
            db.auth._globalAdmins = [];

        db.auth._globalAdmins.push(userId);
    }

    static getMods(chatId) {
        // Return a clone, because Rebridge doesn't support everything
        if(db.auth[chatId] && db.auth[chatId].mods) {
            return db.auth[chatId].mods.slice(0);
        } else {
            return [];
        }
    }

    static getAdmins(chatId) {
        // Return a clone, because Rebridge doesn't support everything
        if(db.auth[chatId] && db.auth[chatId].admins) {
            return db.auth[chatId].admins.slice(0);
        } else {
            return [];
        }
    }

    static getGlobalAdmins() {
        // Return a clone, because Rebridge doesn't support everything
        if(db.auth._globalAdmins) {
            return db.auth._globalAdmins.slice(0);
        } else {
            return [];
        }
    }
}