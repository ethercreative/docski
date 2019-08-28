const chalk = require('chalk')
	, inquirer = require('inquirer')
	, fs = require('fs');

module.exports = async function init () {
	if (fs.existsSync('docski.config.js')) {
		const { overwrite } = await inquirer.prompt([{
			type: 'confirm',
			name: 'overwrite',
			message: 'docski.config.js already exists, overwrite?',
			default: false,
		}]);

		if (!overwrite)
			return;
	}

	const defaultConfig = fs.readFileSync(
		__dirname + "/config/default.js",
		"utf8"
	);

	fs.writeFile("docski.config.js", defaultConfig, err => {
		if (err) throw err;
		console.log(chalk.bold.green("The config file has been saved!"));
	});
};
