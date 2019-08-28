const config = require('./config')
	, chalk  = require('chalk')
	, https  = require('https');

function get (path) {
	console.log(path);
	return new Promise((resolve, reject) => {
		https.request({
			path,
			method: 'GET',
			headers: {
				'Accept': 'application/vnd.github.v3+json',
				'User-Agent': config.githubUsername,
			},
		}, resp => {
			let data = '';

			resp.on('data', (chunk) => {
				data += chunk;
			});

			resp.on('end', () => {
				resolve(data);
			});

		}).on('error', reject);
	});
}

module.exports = async function build (handle) {
	const repo = config.repos[handle];

	if (!repo) {
		console.log(chalk.bold.red('No repo for handle "' + handle + '" found'));
		return;
	}

	try {
		const data = await get(`https://api.github.com/repos/${repo}/contents/docs`);
		console.log(data);
	} catch (e) {
		console.log(e);
	}
};
