const config = require('../config')
	, chalk = require('chalk')
	, { get } = require('./fetch')
	, FeedMe = require('feedme')
	, { history } = require('../storage/history');

module.exports = async function (handle, verbose = false) {
	const repo = config.repos[handle];

	if (!repo)
		throw new Error('Can\'t find repo "' + handle + '"');

	if (verbose)
		console.log(chalk.gray('Checking "' + handle + '"'));

	const feed = await get(`https://github.com/${repo.path}/commits.atom`, false, false);

	try {
		const parser = new FeedMe(true);
		parser.write(feed);
		const { items } = parser.done();

		if (items.length > 0)
			return (new Date(items[0].updated)).getTime() > history[handle];
	} catch (e) {
		console.log(`https://github.com/${repo.path}/commits.atom`);
		console.log(feed);
		console.error(e);
	}

	return false;
};
