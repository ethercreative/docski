---
title: Templating
---

# Templating

Templating is powered by Twig. You can create templates in the `templates` 
directory that was created when you called `docski init`. 

By default all doc files will use the `index.twig` template. You can change what 
template they use by setting the `layout` front-matter to the path of the 
template (without the file extension, relative to the templates root). i.e. to
use the `templates/blog/post.twig` template, you would set `layout` to 
`blog/post`.

**Syntax highlighting** is powered by [highlight.js](https://highlightjs.org/) 
so you'll want to include your chosen themes CSS in your templates if you have
any code that needs highlighting.

## Template Variables

The following variables are passed to each template:

### `data`
This contains all the front-matter that was set in the markdown file.

### `nav`
Contains an iterable object of the entire docs navigation where the key is the 
title of the file or folder, and the value is either the path to the file or the 
children of the folder.

### `toc`
An array containing the table of contents for the file. Each item contains:
- `content` - The content of the heading
- `anchor` - The headings anchor
- `level` - The level of the heading (1-3)

### `docs`
An iterable object of all the docs that Docski is rendering. It is identical to 
your `repos` config object.

### `repo`
The repo object from your config file, including `handle`.

### `url`
The relative URL to this file.

### `content`
The parsed markdown content. 
