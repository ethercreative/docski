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
	.description('Build the given repo handle or all repos if no handle given')
	.action(handle => require('../lib/build')(handle));

program
	.command('watch [handle]')
	.description('Watch the repos for changes and re-build the docs accordingly')
	.action(() => require('../lib/watch')());

program.parse(process.argv);

if (!process.argv.slice(2).length)
	program.outputHelp();
