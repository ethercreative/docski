const config = require('../config')
	, path = require('path')
	, renderTemplate = require('./template');

module.exports = function flat (handle, obj) {
	const url = path.dirname(handle + '.html');
	const pth = handle === 'index' ? config.output : path.join(config.output, handle);
	const tmp = obj.path;

	delete obj.path;

	console.log('Rendering flat', pth);

	renderTemplate(
		tmp,
		{
			url,
			path: pth,
			docs: config.repos,
			...obj,
		}
	);
};
