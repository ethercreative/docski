---
title: Usage
---

# Usage

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
