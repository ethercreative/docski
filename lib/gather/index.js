const sleep = require('../helpers/sleep')
	, database = require('../storage/database')
	, config = require('../config')
	, { get, saveUrl, saveContents } = require('../helpers/fetch')
	, chalk = require('chalk')
	, path = require('path')
	, matter = require('gray-matter')
	, titleCase = require('title-case')
	, { atob, btoa } = require('../helpers/base64');

async function parse (db, repo, filePath, raw) {
	filePath = filePath.replace(/^docs\//, '');

	const md = matter(raw);
	const dir = path.dirname(filePath);
	const name = path.basename(dir, path.extname(dir));

	if (!md.data.title)
		md.data.title = titleCase(name);

	const id = btoa(filePath);

	db.upsert(id, {
		id,
		name,
		path: filePath,
		title: md.data.title,
		data: md.data,
		content: md.content,
	});
}

async function fetch (db, repo, url) {
	console.log('Fetching', url);
	const meta = await get(url);

	// If we don't have an array of items somethings gone wrong!
	if (!Array.isArray(meta)) {
		console.log(
			chalk.bold.red('ERROR:'),
			meta.message,
			url
		);
		return;
	}

	// Loop over all the items in the current directory
	for (const item of meta) {

		// If type is a directory, fetch its contents
		if (item.type === 'dir') {
			await fetch(
				db,
				repo,
				item.url
			);
			continue;
		}

		// Get the content of the item
		const { download_url, content } = await get(item.url);

		if (download_url.endsWith('.docs.json')) {
			let config;
			if (content) config = JSON.parse(atob(content));
			else config = await get(download_url);

			db.config(config);
			continue;
		}

		// If it's a markdown file parse it
		if (download_url.endsWith('.md')) {
			let raw;
			if (content) raw = atob(content);
			else raw = await get(download_url, false);

			await parse(
				db,
				repo,
				item.path,
				raw
			);
			continue;
		}

		// Otherwise just save the file locally in the correct location
		const target = path.join(
			config.output,
			repo.handle,
			item.path.replace(/^docs\//, '')
		);

		// If we have the content use it (so we can bypass any CDN caches)
		if (content) {
			saveContents(
				content,
				target
			);
			continue;
		}

		// Otherwise just download it from the URL
		await saveUrl(
			download_url,
			target
		);

	}
}

module.exports = async function gather (repo, { skipTtl }, db = null) {
	if (!skipTtl) {
		console.log('Waiting for raw.githubusercontent.com TTL');
		await sleep(1000 * 61);
	}

	if (!db)
		db = database(repo.handle);

	// TODO: Instead of emptying the DB, it would be better to check the commit
	//  to see what files have been updated or removed and target those ones
	//  specifically
	db.clear();

	await fetch(
		db,
		repo,
		`https://api.github.com/repos/${repo.path}/contents/docs`
	);
};
