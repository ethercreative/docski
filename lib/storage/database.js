const fs = require('fs')
	, path = require('path');

const cache = {};

module.exports = function getDatabase (handle) {
	const dbPath = '.docski/db/' + handle + '.json';

	let db;
	if (cache.hasOwnProperty(handle)) {
		db = cache[handle];
	} else {
		if (!fs.existsSync(dbPath)) {
			fs.mkdirSync(path.dirname(dbPath), { recursive: true });
			fs.writeFileSync(dbPath, '{}');
		}

		db = JSON.parse(fs.readFileSync(dbPath).toString('utf8'));
		cache[handle] = db;
	}

	const save = () => {
		fs.writeFileSync(dbPath, JSON.stringify(db));
	};

	return {
		select (id) {
			return db[id] || null;
		},
		upsert (id, row) {
			if (db.hasOwnProperty(id))
				row = { ...db[id], ...row };

			db[id] = row;
			save();
		},
		delete (id) {
			delete db[id];
			save();
		},
	};
};
