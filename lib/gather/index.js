const config = require('../config')
	, sleep = require('../helpers/sleep')
	, { get, saveUrl, saveContents } = require('../helpers/fetch')
	, path = require('path')
	, chalk = require('chalk')
	, matter = require('gray-matter')
	, set = require('lodash/set')
	, titleCase = require('title-case');

// Functions
// =========================================================================

async function parse (repo, data, name, pth, raw) {
	const md = matter(raw);
	const dir = path.dirname(pth.replace(/^docs\//, ''))
		, file = path.basename(name, path.extname(name));

	if (!md.data.title)
		md.data.title = titleCase(file);

	// TODO: build search db
	//  - json array of objs, compressed (https://github.com/tcorral/JSONC)
	//  - obj contains title, front-matter, markdown (without formatting characters)
	const key = (dir.replace('/', '.') + '.' + file).replace(/^\.+/, '');
	set(data.docs, key, md);

	if (pth !== 'docs/index.md') {
		const key = (dir.split('/').map(d => titleCase(d)).join('.') + '.' + md.data.title).replace(/^\.+/, '');
		set(data.nav, key, path.join(config.baseUrl, repo.handle, dir, file));
	}
}

async function fetch (repo, data, url) {
	console.log('Fetching', url);
	const meta = await get(url);

	if (!Array.isArray(meta)) {
		console.log(
			chalk.bold.red('ERROR:'),
			meta.message,
			url
		);
		return;
	}

	for (const { name, path: pth, type, url: u } of meta) {
		if (type === 'dir') {
			await fetch(
				repo,
				data,
				u
			);
			continue;
		}

		const { download_url, content } = await get(u);

		if (download_url.endsWith('.md')) {
			let raw;
			if (content) raw = Buffer.from(content, 'base64').toString('utf8');
			else raw = await get(url, false);

			await parse(repo, data, name, pth, raw);
			continue;
		}

		const target = path.join(
			config.output,
			repo.handle,
			pth.replace(/^docs\//, '')
		);

		if (content) {
			saveContents(
				content,
				target
			);
			continue;
		}

		await saveUrl(
			download_url,
			target
		);
	}
}

// Gather
// =========================================================================

module.exports = async function gather (repo, { skipTtl }) {
	const data = {
		docs: {},
		nav: {},
	};

	if (!skipTtl) {
		console.log('Waiting for raw.githubusercontent.com TTL');
		await sleep(1000 * 61);
	}

	await fetch(
		repo,
		data,
		`https://api.github.com/repos/${repo.path}/contents/docs`
	);

	return data;
};
