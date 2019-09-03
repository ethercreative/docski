---
title: Writing
---

# Writing

Write your docs in markdown and place them inside your `docs` folder in the root
of your git repos master branch. The folder structure will mirror the route 
structure in the rendered docs.

## Front-matter
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
