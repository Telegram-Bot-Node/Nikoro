// This is intended to act as a singleton. Because it remains in the require() cache, the
// class will be initialized only once.

class Scheduler {
	constructor() {
	}
	schedule(callback, metadata, timeout) {
	}
}

module.exports = new Scheduler();