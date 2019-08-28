let config;

try {
	config = require(process.cwd() + '/docski.config.js');
} catch (e) {
	config = require('../boilerplate/config');
}

module.exports = config;
