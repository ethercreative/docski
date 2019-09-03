module.exports = {
	atob (encodedData) {
		return Buffer.from(encodedData, 'base64').toString('utf8');
	},
	btoa (stringToEncode) {
		return Buffer.from(stringToEncode, 'utf8').toString('base64');
	},
};
