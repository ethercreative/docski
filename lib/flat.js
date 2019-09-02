const render = require('./render')
	, config = require('./config');

module.exports = async function flat (handle) {
	if (handle) {
		if (!config.flat.hasOwnProperty(handle)) {
			console.error('Can\'t find "' + handle + '"');
			return;
		}

		render.flat(handle, config.flat[handle]);
		return;
	}

	for (let [handle, obj] of Object.entries(config.flat || {}))
		render.flat(handle, obj);
};
