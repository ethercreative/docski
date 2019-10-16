const config = require('./config')
	, chalk  = require('chalk')
	, build = require('./build')
	, sleep = require('./helpers/sleep')
	, checkCommit = require('./helpers/checkCommit');

async function checkForUpdates (handle, flags) {
	if (await checkCommit(handle, flags.verbose))
		await build(handle);

	await sleep(10000);
	await checkForUpdates(handle, flags);
}

async function startWatching (handle, flags) {
	console.log(chalk.bold.green('Watching "' + handle + '"'));
	await checkForUpdates(handle, flags);
}

async function rebuild (handle) {
	console.log(chalk.bold.green('Rebuilding "' + handle + '"'));
	await build(handle, { skipTtl: true, skipCommitCheck: true });
}

module.exports = async function watch (handle, flags) {
	if (flags.flat)
		require('./flat')(handle);

	if (!handle) {
		const keys = Object.keys(config.repos);

		if (flags.rebuild)
			for (let i = 0, l = keys.length; i < l; ++i)
				await rebuild(keys[i]);

		keys.forEach(handle => startWatching(handle, flags));
		return;
	}

	if (flags.rebuild)
		await rebuild(handle);

	await startWatching(handle, flags);
};
