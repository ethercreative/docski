const fs = require('fs');

if (!fs.existsSync('.docski/history.json')) {
	fs.mkdirSync('.docski');
	fs.writeFileSync('.docski/history.json', '{}');
}

let history;

try {
	history = JSON.parse(fs.readFileSync('.docski/history.json').toString('utf8'));
} catch (e) {
	history = {};
}

history = new Proxy(history, {
	get (target, p) {
		return p in target ? target[p] : 0;
	}
});

module.exports = {
	history,
	update (handle) {
		history[handle] = Date.now();
		fs.writeFileSync('.docski/history.json', JSON.stringify(history));
	},
};
