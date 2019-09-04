const renderFlat = require('./render/flat')
	, config = require('./config');

module.exports = async function flat (handle) {
	if (handle) {
		if (!config.flat.hasOwnProperty(handle)) {
			console.error('Can\'t find "' + handle + '"');
			return;
		}

		renderFlat(handle, config.flat[handle]);
		return;
	}

	for (let handle of Object.keys(config.flat || {}))
		await flat(handle);
};
