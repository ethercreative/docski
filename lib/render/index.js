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

			fs.mkdirSync(options.url, { recursive: true });
			fs.writeFileSync(path.join(options.url, filename + '.html'), html);
		}
	);
}

function docs (route = '', repo, { docs: _docs, nav, navIndex }) {
	for (let [name, obj] of Object.entries(_docs)) {
		const slug = paramCase(name)
			, isIndex = slug === 'index';

		const _route = isIndex ? route : path.join(route, slug);

		if (!obj.hasOwnProperty('content'))
			return docs(_route, repo, { docs: obj, nav, navIndex });

		console.log('Rendering', _route);

		let toc;
		const content = md.render(obj.content, {
			tocCallback (_toc) { toc = _toc },
			isIndex,
		});

		const url = path.join(config.output, _route);

		renderTemplate(
			obj.data.layout || 'index',
			{
				data: obj.data,
				content,
				nav: isIndex ? navIndex : nav,
				toc,
				docs: config.repos,
				repo,
				url,
			}
		);
	}
}

function flat (handle, obj) {
	const url = path.join(config.output, path.dirname(handle + '.html'));

	console.log('Rendering flat', url);

	renderTemplate(
		obj.path,
		{
			url,
			docs: config.repos,
			...obj,
		},
		path.basename(handle)
	);
}

module.exports = {
	docs,
	flat,
};
