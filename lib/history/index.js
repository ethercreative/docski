const fs = require('fs');

if (!fs.existsSync('.dockskihistory'))
	fs.writeFileSync('.dockskihistory', '{}');

let history;

try {
	history = JSON.parse(fs.readFileSync('.dockskihistory').toString('utf8'));
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
		fs.writeFileSync('.dockskihistory', JSON.stringify(history));
	},
};
