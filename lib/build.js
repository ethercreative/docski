const config = require('./config')
	, chalk  = require('chalk')
	, path = require('path')
	, gather = require('./gather')
	, rimraf = require('rimraf')
	, { update } = require('./storage/history')
	, { docs } = require('./render');

const flagDefaults = {
	skipTtl: false,
};

module.exports = async function build (handle, { skipTtl } = flagDefaults) {
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
		// TODO: check
		//  1. if we have a DB for this repo
		//  2. if the latest commit timestamp is newer that the one in our history
		const built = await gather(repo, { skipTtl }/*, db*/);
		// TODO: only remove index.html files (since they're the ones we're
		//  creating, we don't want to remove other files like images)
		rimraf.sync(path.join(config.output, handle));
		docs(handle, repo, built);
		update(handle);
	} catch (e) {
		console.log(chalk.red(e.message));
		console.error(e);
	}
};
