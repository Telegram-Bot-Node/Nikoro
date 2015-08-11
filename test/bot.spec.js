var PluginManager = require('../plugins');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var should = chai.should();

describe('bot', function() {

	describe('shutdown', function() {

		it('should wait to safely stop all plugins before shutdown');

		it('should shutdown safely on exception');

		it('should shutdown safely when forced');

	});

})