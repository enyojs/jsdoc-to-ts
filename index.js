const fs = require('fs');
const path = require('path');
const documentation = require('documentation');
const log = require('loglevel');
const prettier = require('prettier');

const {makeParser} = require('./src/parsers');

const sourceExtension = /\.jsx?$/i;

function isDirectory (filePath) {
	return fs.lstatSync(filePath).isDirectory();
}

function isScript (filePath) {
	return filePath.match(sourceExtension) != null;
}

function parse ({path: modulePath, files, format, importMap, output}) {
	const encodeModule = makeParser();

	if (!files || files.length === 0) {
		log.info(`No source files found for ${modulePath}.`);
		return;
	}

	log.info(`Parsing ${modulePath} ...`);
	documentation.build(files, {shallow: true}).then(
		(root) => {
			let result = encodeModule({root, section: root, parent: root, importMap, log}).join('\n');
			const firstNamedEntry = root.find(entry => entry.name);
			let moduleName = firstNamedEntry ? firstNamedEntry.name : '';

			if (format) {
				result = prettier.format(result, {parser: 'typescript'});
			}

			output(moduleName, result);
		}
	).catch((err) => {
		log.error(`Unable to process ${modulePath}: ${err}`);
	});
}

function getSourceFiles (base) {
	return fs.readdirSync(base)
		.map(dirPath => path.join(base, dirPath))
		.filter(isDirectory)
		.map(dirPath => {
			return {
				path: dirPath,
				files: fs.readdirSync(dirPath)
					.map(p => path.join(dirPath, p))
					.filter(isScript)
			};
		});
}

function resolveOutputFilename (modulePath, moduleName) {
	let name;

	const packageJson = path.join(modulePath, 'package.json');
	if (fs.existsSync(packageJson)) {
		name = require(packageJson).main.replace(sourceExtension, '');
	}

	if (!name) {
		if (moduleName) {
			name = moduleName.replace(/.*\//, '');
		} else {
			name = path.basename(modulePath).replace(sourceExtension, '');
		}
	}

	return name;
}

function isRequired (name) {
	throw new Error(`${name} is a required argument`);
}

function main ({package: base = isRequired('package'), logLevel = 'error', format = true, importMap, output = isRequired('output'), outputPath}) {
	log.setLevel(logLevel);

	getSourceFiles(path.resolve(base)).forEach(moduleEntry => {
		const outputBase = outputPath ? path.resolve(path.join(outputPath, path.basename(moduleEntry.path))) : moduleEntry.path;
		parse({
			...moduleEntry,
			format,
			importMap,
			output: (moduleName, result) => {
				const name = resolveOutputFilename(moduleEntry.path, moduleName);
				const file = `${name}.d.ts`;
				output(path.join(outputBase, file), result);
			}
		});
	})
}

module.exports = main;
