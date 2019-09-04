const renderTemplate = require('./template')
	, config = require('../config')
	, path = require('path')
	, paramCase = require('param-case')
	, md = require('../md');

module.exports = function docs (route = '', repo, db, nav) {
	const byId = db.get('__byId');
	const keys = Object.keys(byId);
	for (let i = 0, l = keys.length; i < l; ++i) {
		const doc = byId[keys[i]];

		const slug = paramCase(doc.name);
		const isIndex = slug === 'index';

		const _route = isIndex
			? path.join(config.baseUrl, route)
			: path.join(config.baseUrl, route, slug);

		console.log('Rendering', _route);

		let toc;
		const content = md.render(doc.content, {
			tocCallback (_toc) { toc = _toc },
			isIndex,
			handle: repo.handle,
		});

		renderTemplate(
			doc.data.layout || 'index',
			{
				data: doc.data,
				content,
				nav,
				toc,
				docs: config.repos,
				repo,
				url: _route,
				path: path.join(config.output, _route),
			}
		);
	}
};
