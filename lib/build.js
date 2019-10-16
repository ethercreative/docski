const config = require('./config')
	, chalk  = require('chalk')
	, path = require('path')
	, gather = require('./gather')
	, rimraf = require('rimraf')
	, { update } = require('./storage/history')
	, renderDocs = require('./render/docs')
	, database = require('./storage/database')
	, checkCommit = require('./helpers/checkCommit')
	, buildNav = require('./helpers/buildNav')
	, download = require('./gather/download');

const flagDefaults = {
	skipTtl: false,
	skipCommitCheck: false,
};

module.exports = async function build (
	handle,
	{ skipTtl, skipCommitCheck } = flagDefaults,
) {
	if (!handle) {
		const keys = Object.keys(config.repos);
		for (let i = 0, l = keys.length; i < l; i++)
			await build(keys[i], { skipTtl, skipCommitCheck });
		return;
	}

	const repo = config.repos[handle];

	if (!repo) {
		console.log(chalk.bold.red('No repo for handle "' + handle + '" found'));
		return;
	}

	repo.handle = handle;
	const db = database(handle);

	console.log(chalk.bold.green('Building "' + handle + '"'));

	try {
		// 1. Purge the directory
		// TODO: Only purge files that were removed in the commits since we last
		//  checked
		rimraf.sync(path.join(config.output, handle));

		// 2. Gather any new content
		const hasNewCommit = skipCommitCheck ? true : await checkCommit(handle);
		const dbIsEmpty = db.empty();

		if (hasNewCommit || dbIsEmpty)
			await gather(repo, { skipTtl }, db);

		await download(db);

		// 3. Build nav
		const nav = buildNav(handle, db);

		// 4. Render the docs
		renderDocs(handle, repo, db, nav);

		// 5. Update the last check history
		update(handle);
	} catch (e) {
		console.log(chalk.red(e.message));
		console.error(e);
	}
};
