## 1.0.10 - 2019-08-30
- Remove top index file from nav

## 1.0.9 - 2019-08-30
- Better docs nav

## 1.0.8 - 2019-08-30
- Include index pages in nav
- Make all external links `target="_blank" rel="nofollow noopener"`
- Pass the handle / repo path of the active docs to the template
- Pass the full route (`docski/getting-started/installation`) of the current file to the template
- Custom toc / header anchors
    - Only target headers 1 - 3 for anchors
    - Only target headers 2 - 3 for toc
    - Target anchor should be separate link in the header tag (along side the anchor symbol link)
- Support custom meta data for each repo

        module.exports = {
        	repos: {
        		'docski': {
        			title: 'Docski',
        			path: 'ethercreative/docski',
        			meta: {
        				// custom meta
        				color: 'hotpink',
        			},
        		},
        	},
        };

- Make TTL wait skippable via flag (on build only)

## 1.0.7 - 2019-08-30
- Don't erase existing docs till after new docs have been gathered
- Increase watch duration
- Add docs variable to templates

## 1.0.6 - 2019-08-29
- Add wait for raw.githubusercontent.com TTL before rendering
- Download non-md files and store in relative location
- Fix relative links

## 1.0.5 - 2019-08-29
- Revert previous

## 1.0.4 - 2019-08-29
- Remove file before re-save

## 1.0.3 - 2019-08-29
- Fix typo

## 1.0.2 - 2019-08-29
- Add checking message

## 1.0.1 - 2019-08-29
- Make CLI-able

## 1.0.0 - 2019-08-29
- Initial release
