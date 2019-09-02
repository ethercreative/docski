#!/usr/bin/env node

const program = require('commander');

program
	.version(require('../package').version)
	.usage('<command> [options]');

program
	.command('init')
	.description('Initialize a new docski site')
	.action(() => require('../lib/init')());

program
	.command('build [handle]')
	.option('--skip-ttl', 'Skip the TTL wait')
	.description('Build the given repo handle or all repos if no handle given')
	.action((handle, flags) => require('../lib/build')(handle, flags));

program
	.command('watch [handle]')
	.option('--rebuild', 'Will rebuild everything on run')
	.option('--verbose', 'Will log all the things')
	.description('Watch the repos for changes and re-build the docs accordingly')
	.action((handle, flags) => require('../lib/watch')(handle, flags));

program.parse(process.argv);

if (!process.argv.slice(2).length)
	program.outputHelp();
