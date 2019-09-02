const chalk = require('chalk')
	, inquirer = require('inquirer')
	, fs = require('fs');

const canWrite = async path => {
	if (fs.existsSync(path)) {
		const { overwrite } = await inquirer.prompt([{
			type: 'confirm',
			name: 'overwrite',
			message: path + ' already exists, overwrite?',
			default: false,
		}]);

		if (!overwrite)
			return false;
	}

	return true;
};

module.exports = async function init () {
	if (await canWrite('docski.config.js')) {
		const defaultConfig = fs.readFileSync(
			__dirname + '/boilerplate/config.js',
			'utf8'
		);

		fs.writeFile('docski.config.js', defaultConfig, err => {
			if (err) throw err;
			console.log(chalk.bold.green('The config file has been saved!'));
		});
	}

	if (await canWrite('templates/index.twig')) {
		const defaultTemplate = fs.readFileSync(
			__dirname + '/boilerplate/index.twig',
			'utf8'
		);

		if (!fs.existsSync('templates'))
			fs.mkdirSync('templates');

		fs.writeFile('templates/index.twig', defaultTemplate, err => {
			if (err) throw err;
			console.log(chalk.bold.green('The default index template has been saved!'));
		});
	}

	if (await canWrite('templates/example.twig')) {
		const defaultTemplate = fs.readFileSync(
			__dirname + '/boilerplate/example.twig',
			'utf8'
		);

		if (!fs.existsSync('templates'))
			fs.mkdirSync('templates');

		fs.writeFile('templates/example.twig', defaultTemplate, err => {
			if (err) throw err;
			console.log(chalk.bold.green('The default static example template has been saved!'));
		});
	}
};
