var assert = require("assert");

describe('bot', function() {

	describe('loading plugins', function() {

		it('should read specified plugins from config');

		it('should require all specified plugins');

		it('should initialize all specified plugins');

	});

	describe('message forwarding', function() {

		it('should handle incoming text messages');

		it('should forward all messages to enabled plugins');

		it('should handle reply callbacks from plugins');

		it('should handle text reply types');

		it('should handle audio reply types');

		it('should handle photo reply types');

		it('should handle status reply types');

	});

	describe('sending messages', function() {

		it('should send text messages to api');

		it('should send audio messages to api');

		it('should send photo messages to api');

		it('should send status messages to api');

	});

	describe('lifecycle', function() {

		it('should wait to safely stop all plugins before shutdown');

		it('should shutdown safely on exception');

		it('should shutdown safely when forced');

	});

})