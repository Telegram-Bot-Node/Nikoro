// This is intended to act as a singleton. Because it remains in the require() cache, the
// class will be initialized only once.

const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dbPath = path.join(__dirname, "../../db/helper_Scheduler.json");

/* Schedules events and emits them at a specified date.
 * Events persist across restarts/reboots.
 * When scheduling, take care to add some metadata that uniquely identifies
 * your plugin, so that you don't mistake unrelated events for your own!
 */
class Scheduler extends EventEmitter {
    constructor() {
        super();
        this.events = [];
        if (fs.existsSync(dbPath))
            this.events = JSON.parse(fs.readFileSync(dbPath)).map(it => {it.date = new Date(it.date); return it});
    }
    schedule(name, metadata, _date) {
        assert.deepEqual(typeof metadata, "object", "Metadata must be an object!");
        assert((typeof _date === "object") || (typeof _date === "number"), "Must pass a valid date!");
        const date = Number(_date); // Cast to Unix timestamp
        this.events.push({name, metadata, date});
        const now = new Date();
        setTimeout(() => this.emit(name, metadata), date - now);
        this.synchronize();
    }
    /* Cancels all events that match a specific function.
     * Take care to check for your plugin's metadata, so that you don't
     * accidentally delete other plugins' events!
     */
    cancel(fn) {
        this.events = this.events.filter(fn);
    }

    // Private method
    synchronize() {
        // Remove old events
        const now = new Date();
        this.events = this.events.filter(evt => evt.date >= now);
        fs.writeFileSync(dbPath, JSON.stringify(this.events));
    }
}

module.exports = new Scheduler();