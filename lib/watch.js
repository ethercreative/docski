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

let isFirstIteration = true;

module.exports = async function watch (handle, flags) {
	if (isFirstIteration) {
		isFirstIteration = false;

		if (flags.flat)
			require('./flat')(handle);
	}

	if (!handle) {
		Object.keys(config.repos).forEach(handle => watch(handle, flags));
		return;
	}

	if (flags.rebuild) {
		console.log(chalk.bold.green('Rebuilding "' + handle + '"'));
		await build(handle, { skipTtl: true, skipCommitCheck: true });
	}

	console.log(chalk.bold.green('Watching "' + handle + '"'));

	await checkForUpdates(handle, flags);
};
