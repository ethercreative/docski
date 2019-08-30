const config = require('./config')
	, chalk  = require('chalk')
	, paramCase = require('param-case')
	, path = require('path')
	, Twig = require('twig')
	, md = require('./md')
	, gather = require('./gather')
	, fs = require('fs')
	, rimraf = require('rimraf')
	, { update } = require('./history');

const renderDocs = (route = '', repo, { docs, nav, navIndex }) => {
	for (let [name, obj] of Object.entries(docs)) {
		const slug = paramCase(name);
		const isIndex = slug === 'index';
		const _route = isIndex ? route : path.join(route, slug);

		if (!obj.hasOwnProperty('content'))
			return renderDocs(_route, repo, { docs: obj, nav, navIndex });

		console.log('Rending', _route);

		let toc;
		const content = md.render(obj.content, {
			tocCallback (_toc) { toc = _toc },
			isIndex,
		});

		const url = path.join(config.output, _route);

		Twig.renderFile('templates/' + (obj.data.layout || 'index') + '.twig', {
			data: obj.data,
			content,
			nav: isIndex ? navIndex : nav,
			toc,
			docs: config.repos,
			repo,
			url,
		}, (err, html) => {
			if (err) {
				console.error(err);
				return;
			}

			fs.mkdirSync(url, { recursive: true });
			fs.writeFileSync(path.join(url, 'index.html'), html);
		});
	}
};

module.exports = async function build (handle, { skipTtl }) {
	if (!handle) {
		Object.keys(config.repos).forEach(repo => build(repo, { skipTtl }));
		return;
	}

	const repo = config.repos[handle];

	if (!repo) {
		console.log(chalk.bold.red('No repo for handle "' + handle + '" found'));
		return;
	}

	repo.handle = handle;

	console.log(chalk.bold.green('Building "' + handle + '"'));

	try {
		const built = await gather(repo, { skipTtl });
		rimraf.sync(path.join(config.output, handle));
		renderDocs(handle, repo, built);
		update(handle);
	} catch (e) {
		console.log(chalk.red(e.message));
		console.error(e);
	}
};
