// This is intended to act as a singleton. Because it remains in the require() cache, the
// class will be initialized only once.

const EventEmitter = require("events");

class Scheduler extends EventEmitter {
    // Takes an event name, some metadata and a date, and returns an "event ID"
    // which is persistent across reboots
    schedule(name, metadata, date) {}
    // Cancels an event by ID
    cancel(id) {}
}

module.exports = new Scheduler();