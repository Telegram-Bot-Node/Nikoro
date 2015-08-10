var PluginManager = require('../plugins');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var should = chai.should();

describe('bot', function() {

	describe('message forwarding', function() {

		it('should handle incoming text messages', function() {
			
		});

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

	describe('shutdown', function() {

		it('should wait to safely stop all plugins before shutdown');

		it('should shutdown safely on exception');

		it('should shutdown safely when forced');

	});

})