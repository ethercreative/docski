const config = require('../config')
	, sleep = require('../helpers/sleep')
	, request = require('request')
	, path = require('path')
	, fs = require('fs')
	, chalk = require('chalk')
	, matter = require('gray-matter')
	, titleCase = require('title-case');

// Properties
// =========================================================================

const headers = {
	'User-Agent': 'Docksi',
};
if (config.githubPersonalAccessToken)
	headers['Authorization'] = 'token ' + config.githubPersonalAccessToken;

// Helpers
// =========================================================================

function get (url, json = true) {
	return new Promise((resolve, reject) => {
		request.get({ url, headers }, (err, _, res) => {
			if (err) reject(err);
			else resolve(json ? JSON.parse(res) : res);
		});
	});
}

function saveUrl (url, target) {
	return new Promise((resolve, reject) => {
		fs.mkdirSync(path.dirname(target));
		const file = fs.createWriteStream(target);
		request.get(url).on('response', res => {
			res.pipe(file);
			file.on('finish', () => {
				file.close();
				resolve();
			});
		}).on('error', err => {
			fs.unlink(
				target,
				() => reject(err)
			);
		});
	});
}

function saveContents (contents, target) {
	fs.writeFileSync(
		target,
		Buffer.from(contents, 'base64').toString('utf8')
	);
}

// Functions
// =========================================================================

async function parse (repo, data, name, pth, raw) {
	const md = matter(raw);
	const dir = path.dirname(pth.replace(/^docs\//, ''))
		, file = path.basename(name, path.extname(name));

	// TODO: build search db
	//  - json array of objs, compressed (https://github.com/tcorral/JSONC)
	//  - obj contains title, front-matter, markdown (without formatting characters)
	data.docs[file] = md;

	if (!md.data.title)
		md.data.title = titleCase(file);

	if (pth !== 'docs/index.md') {
		data.nav[md.data.title] = path.join('../', dir, file);
		data.navIndex[md.data.title] = path.join('./', dir, file);
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
				path.join(url, name)
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
		navIndex: {},
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
