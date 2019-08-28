let config;

try {
	config = require(process.cwd() + '/docski.config.js');
} catch (e) {
	config = require('./default');
}

module.exports = config;
