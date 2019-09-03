const Markdown = require('markdown-it')
	, config = require('../config')
	, path = require('path')
	, hljs = require('highlight.js');

const md = Markdown({
	highlight: function (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (_) {}
		}

		return ''; // use external default escaping
	},
	replaceLink: function (link, env) {
		if (link.indexOf('//') > -1)
			return link;

		if (env.isIndex)
			return path.join(config.baseUrl, env.handle, link);

		return path.join(config.baseUrl, env.handle, '../', link);
	},
});

md.use(require('./toc'), {
	anchorClassName: 'anchor',
});

md.use(require('markdown-it-replace-link'));

md.use(require('markdown-it-external-links'), {
	externalClassName: null,
	externalTarget: '_blank',
	externalRel: 'nofollow noopener',
});

module.exports = md;
