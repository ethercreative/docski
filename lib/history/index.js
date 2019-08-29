const fs = require('fs');

if (!fs.existsSync('.docskihistory'))
	fs.writeFileSync('.docskihistory', '{}');

let history;

try {
	history = JSON.parse(fs.readFileSync('.docskihistory').toString('utf8'));
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
		fs.writeFileSync('.docskihistory', JSON.stringify(history));
	},
};
