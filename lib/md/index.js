const Markdown = require('markdown-it')
	, config = require('../config')
	, path = require('path')
	, Prism = require('prismjs')
	, loadLanguages = require('prismjs/components/');

const md = Markdown({
	html: true,
	highlight: function (str, lang) {
		if (lang) {
			try {
				loadLanguages([lang]);
			} catch (_) {}

			try {
				return Prism.highlight(str, Prism.languages[lang], lang);
			} catch (_) {}
		}

		return ''; // use external default escaping
	},
	replaceLink: function (link, env) {
		if (link.indexOf('//') > -1)
			return link;

		link = link.replace('.md', '');

		if (env.isIndex)
			return path.join(config.baseUrl, env.handle, link);

		if (link[0] === '#')
			return link;

		if (link.indexOf('./') === 0)
			return '.' + link;

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
