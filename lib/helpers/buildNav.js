const config = require('../config')
	, path = require('path')
	, titleCase = require('title-case');

function tree (url, obj) {
	const nav = {};

	for (let [p, o] of Object.entries(obj)) {
		const route = path.join(url, p);

		if (typeof o !== 'string') {
			const label = o._label || titleCase(p);
			delete o._label;
			nav[label] = tree(route, o);
			continue;
		}

		if (p === 'index') nav[o] = url;
		else nav[o] = route;
	}

	return nav;
}

module.exports = function buildNav (handle, db) {
	return tree(path.join(config.baseUrl, handle), db.get('__config').nav);
};
