const config = require('./config')
	, chalk  = require('chalk')
	, fetch  = require('node-fetch')
	, titleCase = require('title-case')
	, paramCase = require('param-case')
	, matter = require('gray-matter')
	, path = require('path')
	, Twig = require('twig')
	, Markdown = require('markdown-it')
	, fs = require('fs')
	, request = require('request')
	, rimraf = require('rimraf')
	, hljs = require('highlight.js')
	, { update } = require('./history')
	, sleep = require('./helpers/sleep');

const md = Markdown({
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (_) {}
		}

		return ''; // use external default escaping
	},
	replaceLink: function (link, env) {
		if (!link.startsWith('.') || env.isIndex)
			return link;

		return '../' + link;
	},
});

md.use(require('./md/toc'), {
	anchorClassName: 'anchor',
});

md.use(require('markdown-it-replace-link'));

md.use(require('markdown-it-external-links'), {
	externalClassName: null,
	externalTarget: '_blank',
	externalRel: 'nofollow noopener',
});

const headers =  config.githubPersonalAccessToken ? {
	'Authorization': 'token ' + config.githubPersonalAccessToken,
} : {};

const buildDocs = async (url, handle, skipTtl = false) => {
	const docs = {}
		, nav = {}
		, indexNav = {};

	console.log('Fetching', url);
	const data = await fetch(url, {
		method: 'GET',
		headers,
	}).then(res => res.json());

	if (!Array.isArray(data))
		throw new Error(data.message);

	if (!skipTtl) {
		console.log('Waiting for raw.githubusercontent.com TTL');
		await sleep(1000 * 61); // Wait for raw.githubusercontent.com TTL
	}

	for (const { name, path: p, type, download_url } of data) {
		if (type === 'file') {
			if (!download_url.endsWith('.md')) {
				await new Promise((resolve, reject) => {
					const dir = path.join(config.output, handle, p.replace(/^docs\//, ''));
					fs.mkdirSync(path.dirname(dir), { recursive: true });
					const file = fs.createWriteStream(dir);
					request.get(download_url).on('response', function (response) {
						response.pipe(file);
						file.on('finish', function() {
							file.close();
							resolve();
						});
					}).on('error', function(err) {
						fs.unlink(dir, () => {
							reject(err);
						});
					});
				});

				continue;
			}

			const md = matter(await fetch(download_url + '?v=' + Date.now()).then(res => res.text()));
			const dir = path.dirname(p.replace(/^docs\//, ''))
				, file = path.basename(name, path.extname(name));

			docs[file] = md;

			if (!md.data.title)
				md.data.title = titleCase(md.data.title || file);

			const isIndex = p === 'docs/index.md';

			nav[md.data.title] = path.join('../', dir, isIndex ? '' : file);
			indexNav[md.data.title] = path.join('./', dir, isIndex ? '' : file);
		} else {
			const { docs: d, nav: n, indexNav: iN } = await buildDocs(url + '/' + name);
			docs[name] = d;
			nav[titleCase(name)] = n;
			indexNav[titleCase(name)] = iN;
		}
	}

	return { docs, nav, indexNav };
};

const renderDocs = (route = '', repo, { docs, nav, indexNav }) => {
	for (let [name, obj] of Object.entries(docs)) {
		const slug = paramCase(name);
		const isIndex = slug === 'index';
		const _route = isIndex ? route : path.join(route, slug);

		if (!obj.hasOwnProperty('content'))
			return renderDocs(_route, repo, { docs: obj, nav, indexNav });

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
			nav: isIndex ? indexNav : nav,
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
		const built = await buildDocs(`https://api.github.com/repos/${repo.path}/contents/docs`, handle, skipTtl);
		rimraf.sync(path.join(config.output, handle));
		renderDocs(handle, repo, built);
		update(handle);
	} catch (e) {
		console.log(chalk.red(e.message));
		console.error(e);
	}
};
