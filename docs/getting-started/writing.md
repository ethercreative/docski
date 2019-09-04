---
title: Writing
---

# Writing

Write your docs in markdown and place them inside your `docs` folder in the root
of your git repos master branch. The folder structure will mirror the route 
structure in the rendered docs.

## Navigation

You can specify the navigation of your docs by creating a `.docs.json` file in 
the root of your `docs/` directory and adding the following:

```json
{
  "nav": {
    "index": "Docski",
    "getting-started": {
      "_label": "Getting Started",
      "config": "Configuration"
    }
  }
}
```

The `nav` object contains keys matching the path to the file or folder, and 
values for the user facing title if it's a path, or the files inside if it's a 
folder. The `_label` key allows you to set the label of the folder.

## Front-matter

You can include front-matter at the top of your markdown files. It should be 
valid YAML and contained within 3 dash blocks:

```yaml
---
title: Hello world!
layout: post
colour: hotpink
---
```

There are two values that are used internally, but are both optional:
- `title` The title of the document (will default to the name of the file in 
Title Case)
- `layout` The path to the twig file in your templates folder (without the 
`.twig` extension).

All other attribute are custom and can be whatever you want. You can access all
front-matter via the `data` variable in your templates.
