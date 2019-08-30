const uslug = require('uslug')
	, clone = require('clone')
	, Token = require('markdown-it/lib/token');

/**
 * Modified from
 * https://github.com/medfreeman/markdown-it-toc-and-anchor/blob/master/src/index.js
 */

// Properties
// =========================================================================

let headingIds = {};

// Helpers
// =========================================================================

const makeSafe = (string, headingIds) => {
	const key = uslug(string);
	if (!headingIds[key]) {
		headingIds[key] = 0;
	}
	headingIds[key]++;
	return key + (headingIds[key] > 1 ? `-${headingIds[key]}` : "");
};

const space = () => {
	return { ...new Token("text", "", 0), content: " " };
};

const renderAnchor = (anchor, options, tokens, idx) => {
	const attrs = [
		['id', anchor],
		['aria-hidden', 'true'],
	];

	if (options.anchorClassName != null)
		attrs.push(['class', options.anchorClassName]);

	const anchorTokens = [
		{
			...new Token("link_open", "a", 1),
			attrs,
		},
		new Token("link_close", "a", -1),
	];

	tokens[idx + 1].children.unshift(
		...anchorTokens
	);
};

const renderAnchorLinkSymbol = options => {
	if (options.anchorLinkSymbolClassName) {
		return [
			{
				...new Token("span_open", "span", 1),
				attrs: [["class", options.anchorLinkSymbolClassName]]
			},
			{
				...new Token("text", "", 0),
				content: options.anchorLinkSymbol
			},
			new Token("span_close", "span", -1)
		];
	} else {
		return [
			{
				...new Token("text", "", 0),
				content: options.anchorLinkSymbol
			}
		];
	}
};

const renderAnchorLink = (anchor, options, tokens, idx) => {
	const attrs = [
		['aria-hidden', 'true'],
		['href', `#${anchor}`]
	];

	if (options.anchorLinkClassName != null) {
		attrs.push(["class", options.anchorLinkClassName]);
	}

	const openLinkToken = {
		...new Token("link_open", "a", 1),
		attrs
	};
	const closeLinkToken = new Token("link_close", "a", -1);

	if (options.wrapHeadingTextInAnchor) {
		tokens[idx + 1].children.unshift(openLinkToken);
		tokens[idx + 1].children.push(closeLinkToken);
	} else {
		const linkTokens = [
			openLinkToken,
			...renderAnchorLinkSymbol(options),
			closeLinkToken
		];

		// `push` or `unshift` according to anchorLinkBefore option
		// space is at the opposite side.
		const actionOnArray = {
			false: "push",
			true: "unshift"
		};

		// insert space between anchor link and heading ?
		if (options.anchorLinkSpace) {
			linkTokens[actionOnArray[!options.anchorLinkBefore]](space());
		}
		tokens[idx + 1].children[actionOnArray[options.anchorLinkBefore]](
			...linkTokens
		);
	}
};

// Plugin
// =========================================================================

module.exports = function (md, options) {
	options = {
		tocFirstLevel: 2,
		tocLastLevel: 3,
		tocCallback: null,
		anchorClassName: null,
		anchorLink: true,
		anchorLinkSymbol: '#',
		anchorLinkBefore: true,
		anchorLinkClassName: null,
		anchorFirstLevel: 1,
		anchorLastLevel: 3,
		resetIds: true,
		anchorLinkSpace: true,
		anchorLinkSymbolClassName: null,
		anchorLinkPrefix: null,
		wrapHeadingTextInAnchor: false,
		...options
	};

	// Initialize key ids for each instance
	headingIds = {};

	md.core.ruler.push('init_toc', function (state) {
		const tokens = state.tokens;

		// Reset key ids for each document
		if (options.resetIds)
			headingIds = {};

		const tocArray = [];

		for (let i = 0, l = tokens.length; i < l; i++) {
			if (tokens[i].type !== 'heading_close')
				continue;

			const heading = tokens[i - 1]
				, heading_close = tokens[i];

			const level = +heading_close.tag.substr(1, 1);

			if (heading.type !== 'inline')
				continue;

			let content;

			if (
				heading.children &&
				heading.children.length > 0 &&
				heading.children[0].type === 'link_open'
			) {
				// Headings that contain links have to be processed
				// differently, since nested links aren't allowed in
				// markdown.
				content = heading.children[1].content;
				heading._tocAnchor = makeSafe(content, headingIds);
			} else {
				content = heading.content;
				heading._tocAnchor = makeSafe(
					heading.children.reduce((a, t) => a + t.content, ''),
					headingIds
				);
			}

			if (options.anchorLinkPrefix)
				heading._tocAnchor = options.anchorLinkPrefix + heading._tocAnchor;

			heading._tocLevel = level;

			if (level < options.tocFirstLevel || level > options.tocLastLevel)
				continue;

			tocArray.push({
				content,
				anchor: heading._tocAnchor,
				level,
			});
		}

		if (typeof state.env.tocCallback === 'function') {
			state.env.tocCallback.call(undefined, tocArray);
		} else if (typeof options.tocCallback === 'function') {
			options.tocCallback.call(undefined, tocArray);
		} else if (typeof md.options.tocCallback === 'function') {
			md.options.tocCallback.call(undefined, tocArray);
		}
	});

	const originalHeadingOpen =
		md.renderer.rules.heading_open ||
		function (...args) {
			const [tokens, idx, options, , self] = args;
			return self.renderToken(tokens, idx, options);
		};

	md.renderer.rules.heading_open = function (...args) {
		const [tokens, idx, , , ] = args;

		tokens[idx].attrs = tokens[idx].attrs || [];

		const anchor = tokens[idx + 1]._tocAnchor
			, level = tokens[idx + 1]._tocLevel;

		if (level < options.anchorFirstLevel || level > options.anchorLastLevel)
			return originalHeadingOpen.apply(this, args);

		if (options.anchorLink)
			renderAnchorLink(anchor, options, ...args);

		renderAnchor(anchor, options, ...args);

		return originalHeadingOpen.apply(this, args);
	};
};
