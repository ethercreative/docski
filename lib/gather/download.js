const { saveUrl } = require('../helpers/fetch');

module.exports = async function download (db) {
	const byId = db.get('__byId');
	const keys = Object.keys(byId);
	for (let i = 0, l = keys.length; i < l; ++i) {
		const file = byId[keys[i]];

		if (!file.hasOwnProperty('download_url'))
			continue;

		await saveUrl(
			file.download_url,
			file.path
		);
	}
};
