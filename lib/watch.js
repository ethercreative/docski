const config = require('./config')
	, chalk  = require('chalk')
	, fetch  = require('node-fetch')
	, FeedMe = require('feedme')
	, { history } = require('./history')
	, build = require('./build')
	, sleep = require('./helpers/sleep');

const headers =  config.githubPersonalAccessToken ? {
	'Authorization': 'token ' + config.githubPersonalAccessToken,
} : {};

async function checkForUpdates (handle) {
	const repo = config.repos[handle];

	console.log(chalk.gray('Checking "' + handle + '"'));
	const feed = await fetch(`https://github.com/${repo}/commits.atom`, {
		method: 'GET',
		headers,
	}).then(res => res.text());

	const parser = new FeedMe(true);
	parser.write(feed);
	const { items } = parser.done();

	if (items.length > 0) {
		const updated = new Date(items[0].updated);

		if (updated.getTime() > history[handle])
			await build(handle);
	}

	await sleep(5000);
	await checkForUpdates(handle);
}

module.exports = async function watch (handle) {
	if (!handle) {
		Object.keys(config.repos).forEach(watch);
		return;
	}

	console.log(chalk.bold.green('Watching "' + handle + '"'));

	await checkForUpdates(handle);
};
