const config = require('../config')
	, path = require('path')
	, md = require('../md')
	, Twig = require('twig')
	, fs = require('fs')
	, paramCase = require('param-case')
	, minify = require('html-minifier').minify;

function renderTemplate (template, options, filename = 'index') {
	Twig.renderFile(
		path.join('templates/', template + '.twig'),
		options,
		(err, html) => {
			if (err) {
				console.error(err);
				return;
			}

			html = minify(html, {
				collapseBooleanAttributes: true,
				collapseWhitespace: true,
				decodeEntities: true,
				minifyCSS: true,
				minifyJS: true,
				processConditionalComments: true,
				processScripts: ['text/html'],
				removeAttributeQuotes: true,
				removeComments: true,
				removeEmptyAttributes: true,
				removeOptionalTags: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				trimCustomFragments: true,
				useShortDoctype: true,
			});

			fs.mkdirSync(options.path, { recursive: true });
			fs.writeFileSync(path.join(options.path, filename + '.html'), html);
		}
	);
}

function docs (route = '', repo, { docs: _docs, nav }) {
	for (let [name, obj] of Object.entries(_docs)) {
		const slug = paramCase(name)
			, isIndex = slug === 'index';

		const _route = isIndex
			? path.join(config.baseUrl, route)
			: path.join(config.baseUrl, route, slug);

		if (!obj.hasOwnProperty('content')) {
			docs(_route, repo, { docs: obj, nav });
			continue;
		}

		console.log('Rendering', _route);

		let toc;
		const content = md.render(obj.content, {
			tocCallback (_toc) { toc = _toc },
			isIndex,
			handle: repo.handle,
		});

		renderTemplate(
			obj.data.layout || 'index',
			{
				data: obj.data,
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
}

function flat (handle, obj) {
	const url = path.dirname(handle + '.html');
	const pth = path.join(config.output, obj.path);
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
}

module.exports = {
	docs,
	flat,
};
