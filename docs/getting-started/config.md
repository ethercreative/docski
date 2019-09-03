---
title: Config
---

# Config

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
