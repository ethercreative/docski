const config = require('../config')
	, fs = require('fs')
	, request = require('request')
	, path = require('path');

const headers = {
	'User-Agent': 'Docksi',
};
if (config.githubPersonalAccessToken)
	headers['Authorization'] = 'token ' + config.githubPersonalAccessToken;

function get (url, json = true, includeHeaders = true) {
	return new Promise((resolve, reject) => {
		request.get({
			url,
			headers: includeHeaders ? headers : {},
		}, (err, _, res) => {
			if (err) reject(err);
			else resolve(json ? JSON.parse(res) : res);
		});
	});
}

function saveUrl (url, target) {
	return new Promise((resolve, reject) => {
		if (!fs.existsSync(path.dirname(target)))
			fs.mkdirSync(path.dirname(target), { recursive: true });

		const file = fs.createWriteStream(target);
		request.get(url).on('response', res => {
			res.pipe(file);
			file.on('finish', () => {
				file.close();
				resolve();
			});
		}).on('error', err => {
			fs.unlink(
				target,
				() => reject(err)
			);
		});
	});
}

function saveContents (contents, target) {
	if (!fs.existsSync(path.dirname(target)))
		fs.mkdirSync(path.dirname(target), { recursive: true });

	fs.writeFileSync(
		target,
		Buffer.from(contents, 'base64').toString('utf8')
	);
}

module.exports = {
	get,
	saveUrl,
	saveContents,
};
