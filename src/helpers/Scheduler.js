// This is intended to act as a singleton. Because it remains in the require() cache, the
// class will be initialized only once.

const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const cron = require("cron");

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
        this.crons = [];
        if (fs.existsSync(dbPath)) {
            const entries = JSON.parse(fs.readFileSync(dbPath));
            entries
                .filter(it => "date" in it)
                .map(it => {it.date = new Date(it.date); return it})
                .forEach(({name, metadata, date}) => this.scheduleOneoff(name, metadata, date));
            entries
                .filter(it => "cronString" in it)
                .forEach(({name, metadata, cronString}) => this.scheduleCron(name, metadata, cronString));
        }
    }
    scheduleOneoff(name, metadata, _date) {
        assert.deepEqual(typeof metadata, "object", "Metadata must be an object!");
        assert((typeof _date === "object") || (typeof _date === "number"), "Must pass a valid date!");
        const date = Number(_date); // Cast to Unix timestamp
        this.events.push({name, metadata, date});
        const now = new Date();
        if ((date - now) < Math.pow(2, 32)) // setTimeout can only schedule 2^32 ms in the future
            setTimeout(() => this.emit(name, metadata), date - now);
        this.synchronize();
    }
    scheduleCron(name, metadata, cronString) {
        assert.deepEqual(typeof metadata, "object", "Metadata must be an object!");
        assert.deepEqual(typeof cronString, "string", "Must pass a valid cron string!");

        const job = new cron.CronJob(cronString, () => this.emit(name, metadata), undefined, true);
        this.crons.push({name, metadata, cronString, job});
        this.synchronize();
    }
    /* Cancels all events that match a specific function.
     * Take care to check for your plugin's metadata, so that you don't
     * accidentally delete other plugins' events!
     */
    cancel(fn) {
        this.events = this.events.filter(it => !fn(it));
        this.crons.filter(it => {
            if (!fn(it))
                return true;
            it.job.stop();
            return false;
        });
    }

    // Private method
    synchronize() {
        // Remove old events
        const now = new Date();
        this.events = this.events.filter(evt => evt.date >= now);
        const serializableCrons = this.crons.map(({name, metadata, cronString}) => ({name, metadata, cronString}));
        const serializableData = this.events.concat(serializableCrons);
        fs.writeFileSync(dbPath, JSON.stringify(serializableData));
    }
}

module.exports = new Scheduler();