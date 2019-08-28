const config = require('./config')
	, chalk  = require('chalk')
	, fetch  = require('node-fetch');

const walkDocs = async url => {
	const docs = {};
	const data = await fetch(url).then(res => res.json());

	for (const { name, type, download_url } of data) {
		if (type === 'file') docs[name] = await fetch(download_url).then(res => res.text());
		else docs[name] = await walkDocs(url + '/' + name);
	}

	return docs;
};

module.exports = async function build (handle) {
	const repo = config.repos[handle];

	if (!repo) {
		console.log(chalk.bold.red('No repo for handle "' + handle + '" found'));
		return;
	}

	try {
		const docs = await walkDocs(`https://api.github.com/repos/${repo}/contents/docs`);
		console.log(docs);
	} catch (e) {
		console.log(chalk.red(e.message));
		return;
	}
};
