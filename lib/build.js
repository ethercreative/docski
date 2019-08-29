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
	, rimraf = require('rimraf');

const md = Markdown({
	langPrefix: 'lang-',
});

const headers =  config.githubPersonalAccessToken ? {
	'Authorization': 'token ' + config.githubPersonalAccessToken,
} : {};

const buildDocs = async url => {
	const docs = {}
		, nav = {};

	console.log('Fetching', url);
	const data = await fetch(url, {
		method: 'GET',
		headers,
	}).then(res => res.json());

	if (!Array.isArray(data))
		throw new Error(data.message);

	for (const { name, path: p, type, download_url } of data) {
		if (type === 'file') {
			const md = matter(await fetch(download_url).then(res => res.text()));
			const dir = path.dirname(p.replace(/^docs\//, ''))
				, file = path.basename(name, path.extname(name));

			docs[file] = md;

			if (!md.data.title)
				md.data.title = titleCase(md.data.title || file);

			if (p !== 'docs/index.md')
				nav[md.data.title] = dir + '/' + file;
		} else {
			const { docs: d, nav: n } = await buildDocs(url + '/' + name);
			docs[name] = d;
			nav[titleCase(name)] = n;
		}
	}

	return { docs, nav };
};

const renderDocs = (route = '', docs, nav) => {
	for (let [name, obj] of Object.entries(docs)) {
		const slug = paramCase(name);
		const _route = slug === 'index' ? route : path.join(route, slug);

		if (!obj.hasOwnProperty('content'))
			return renderDocs(_route, obj, nav);

		console.log('Rending', _route);
		Twig.renderFile('templates/' + (obj.data.layout || 'index') + '.twig', {
			data: obj.data,
			content: md.render(obj.content),
			nav,
		}, (err, html) => {
			if (err) {
				console.error(err);
				return;
			}

			fs.mkdirSync(path.join(config.output, _route), { recursive: true });
			fs.writeFileSync(path.join(config.output, _route, 'index.html'), html);
		});
	}
};

module.exports = async function build (handle) {
	if (!handle) {
		Object.keys(config.repos).forEach(build);
		return;
	}

	const repo = config.repos[handle];

	if (!repo) {
		console.log(chalk.bold.red('No repo for handle "' + handle + '" found'));
		return;
	}

	try {
		rimraf.sync(path.join(config.output, handle));
		const { docs, nav } = await buildDocs(`https://api.github.com/repos/${repo}/contents/docs`);
		renderDocs(handle, docs, nav);
	} catch (e) {
		console.log(chalk.red(e.message));
		console.error(e);
	}
};
