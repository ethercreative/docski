const config = require('./config')
	, chalk  = require('chalk')
	, { get }  = require('./helpers/fetch')
	, FeedMe = require('feedme')
	, { history } = require('./history')
	, build = require('./build')
	, sleep = require('./helpers/sleep');

async function checkForUpdates (handle, flags) {
	const repo = config.repos[handle];

	if (flags.verbose) console.log(chalk.gray('Checking "' + handle + '"'));
	const feed = await get(`https://github.com/${repo.path}/commits.atom`, false);

	const parser = new FeedMe(true);
	parser.write(feed);
	const { items } = parser.done();

	if (items.length > 0) {
		const updated = new Date(items[0].updated);

		if (updated.getTime() > history[handle])
			await build(handle);
	}

	await sleep(10000);
	await checkForUpdates(handle, flags);
}

module.exports = async function watch (handle, flags) {
	if (!handle) {
		Object.keys(config.repos).forEach(handle => watch(handle, flags));
		return;
	}

	if (flags.rebuild) {
		console.log(chalk.bold.green('Rebuilding "' + handle + '"'));
		await build(handle, { skipTtl: true });
	}

	console.log(chalk.bold.green('Watching "' + handle + '"'));

	await checkForUpdates(handle, flags);
};
