---
title: Docski
layout: index
---
# Docski 🚢⛷

Convert markdown files in your repo's `docs/` directory into static HTML docs.

## Install

```bash
npm install -s docski
yarn add docski
```

## Usage

### `docski init`
Will setup your docski environment.

### `docski build [handle]`
Will build the static docs for your repos (or just the repo of the given handle)

### `docski watch [handle]`
Will watch the repos (or just the repo of the given handle) for new commits, 
and will re-build the docs when a commit is pushed.

## Config

### `githubPersonalAccessToken`
Setting this will increase your hourly rate limit from 60 to 5000 (useful if 
you've got a lot of documentation). It will also let you access your private 
repos.

### `output`
The directory you want the static files to be saved to.

### `repos`
A key value object of the repos you want to build, where the key is the handle 
you want to use for that repo (will also be the folder name containing the 
static files), and the value is the repo handle (`username/repo-name`).

## Templating

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

### Template Variables

The following variables are passed to each template:

#### `data`
This contains all the front-matter that was set in the markdown file.

#### `nav`
Contains a iterable object of the entire docs navigation where the key is the 
title of the file or folder, and the value is either the path to the file or the 
children of the folder.

#### `toc`
An array containing the table of contents for the file. Each item contains:
- `content` - The content of the heading
- `anchor` - The headings anchor
- `level` - The level of the heading (1-3)

#### `content`
The parsed markdown content. 
