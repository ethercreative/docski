---
title: Docski
layout: index
---
# Docski

Convert markdown files in your repo's `docs/` directory into static HTML docs.

## Install

```bash
npm install -s docski
yarn add docski
```

## Usage

### `docski init`
Will setup your docski environment.

### `docski build [handle] [--skip-ttl]`
Will build the static docs for your repos (or just the repo of the given handle)
- `--skip-ttl` will skip the wait for TTL (Fastly cache). This can be included 
if you're confident that all files will be under 1MB. 

### `docski watch [handle] [--rebuild] [--verbose]`
Will watch the repos (or just the repo of the given handle) for new commits, 
and will re-build the docs when a commit is pushed.
- `--rebulid` will rebuild the repo(s) on initial startup
- `--verbose` will log verbosely

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
static files), and the value is an object containing the docs title, repo path
and custom meta.

## Writing

Write your docs in markdown and place them inside your `docs` folder in the root
of your git repos master branch. The folder structure will mirror the route 
structure in the rendered docs.

### Front-matter
You can include front-matter at the top of your markdown files. It should be 
valid YAML and contained within 3 dash blocks:

```markdown

---
title: Hello world!
layout: post
colour: hotpink
---

... Your markdown ...
```

There are two values that are used internally, but are both optional:
- `title` The title of the document (will default to the name of the file in 
Title Case)
- `layout` The path to the twig file in your templates folder (without the 
`.twig` extension).

All other attribute are custom and can be whatever you want. You can access all
front-matter via the `data` variable in your templates.

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
Contains an iterable object of the entire docs navigation where the key is the 
title of the file or folder, and the value is either the path to the file or the 
children of the folder.

#### `toc`
An array containing the table of contents for the file. Each item contains:
- `content` - The content of the heading
- `anchor` - The headings anchor
- `level` - The level of the heading (1-3)

#### `docs`
An iterable object of all the docs that Docski is rendering. It is identical to 
your `repos` config object.

#### `repo`
The repo object from your config file, including `handle`.

#### `url`
The relative URL to this file.

#### `content`
The parsed markdown content. 
