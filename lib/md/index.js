const Markdown = require('markdown-it')
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
		if (!link.startsWith('.') || env.isIndex)
			return link;

		return '../' + link;
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
