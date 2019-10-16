const fs = require('fs')
	, path = require('path');

const cache = {};
const EMPTY_DB = Object.freeze({
	__byId: {},
	__byPath: {},
	__config: {
		nav: {},
	},
});

module.exports = function getDatabase (handle) {
	const dbPath = '.docski/db/' + handle + '.json';

	let db;
	if (cache.hasOwnProperty(handle)) {
		db = cache[handle];
	} else {
		if (!fs.existsSync(dbPath)) {
			fs.mkdirSync(path.dirname(dbPath), { recursive: true });
			fs.writeFileSync(dbPath, JSON.stringify(EMPTY_DB));
		}

		db = JSON.parse(fs.readFileSync(dbPath).toString('utf8'));
		cache[handle] = db;
	}

	const save = () => {
		fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
	};

	return {
		all () {
			return {...db, dbPath};
		},
		empty () {
			return Object.keys(db.__byId).length === 0;
		},
		clear () {
			db = JSON.parse(JSON.stringify(EMPTY_DB));
			cache[handle] = db;
			save();
		},
		select ({ id, path }) {
			if (id) return db.__byId[id] || null;
			else if (path) {
				return (db.__byPath[path] || [])
					.map(id => db.__byId[id] || null)
					.filter(Boolean);
			}
		},
		upsert (id, row) {
			if (!row.hasOwnProperty('path'))
				throw new Error('[Upsert] Row is missing path!');

			if (db.__byId.hasOwnProperty(id))
				row = { ...db.__byId[id], ...row };

			if (!db.__byPath.hasOwnProperty(row.path))
				db.__byPath[row.path] = [];

			if (db.__byPath[row.path].indexOf(id) === -1)
				db.__byPath[row.path].push(id);

			row.updated = Date.now();
			db.__byId[id] = row;
			save();
		},
		config (config) {
			db.__config = {
				...EMPTY_DB.__config,
				...config,
			};
			save();
		},
		get (key) {
			return db[key];
		},
		delete (id) {
			const row = db.__byId[id];
			if (!row) return;

			delete db.__byId[id];
			db.__byPath[row.path].splice(
				db.__byPath[row.path].indexOf(id),
				1
			);

			save();
		},
	};
};
