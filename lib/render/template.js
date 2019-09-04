const Twig = require('twig')
	, fs = require('fs')
	, minify = require('html-minifier').minify
	, path = require('path');

module.exports = function renderTemplate (template, options, filename = 'index') {
	Twig.renderFile(
		path.join('templates/', template + '.twig'),
		options,
		(err, html) => {
			if (err) {
				console.error(err);
				return;
			}

			html = minify(html, {
				collapseBooleanAttributes: true,
				collapseWhitespace: true,
				decodeEntities: true,
				minifyCSS: true,
				minifyJS: true,
				processConditionalComments: true,
				processScripts: ['text/html'],
				removeAttributeQuotes: true,
				removeComments: true,
				removeEmptyAttributes: true,
				removeOptionalTags: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				trimCustomFragments: true,
				useShortDoctype: true,
			});

			fs.mkdirSync(options.path, { recursive: true });
			fs.writeFileSync(path.join(options.path, filename + '.html'), html);
		}
	);
};
