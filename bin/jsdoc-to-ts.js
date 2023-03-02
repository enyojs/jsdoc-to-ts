#!/usr/bin/env node

/* eslint-disable no-console */

'use strict';

import fs from 'fs';
import url from 'url';
import path from 'path';
import minimist from 'minimist';
import jsdocToTs from '../index.js';

// Uncaught error handler
process.on('uncaughtException', err => console.error(err.stack));

function displayHelp () {
	const modulePath = url.fileURLToPath(import.meta.url);
	const pkg = JSON.parse(fs.readFileSync(path.resolve(modulePath + '../../../package.json'), 'utf-8'));
	let e = 'node ' + path.relative(process.cwd(), modulePath);
	if (process.argv[1] !== modulePath) e = 'jsdoc-to-ts';

	console.log('  jsdoc-to-ts v' + pkg.version);
	console.log();
	console.log('  Usage');
	console.log(`    ${e} [options] [source]`);
	console.log();
	console.log('  Arguments');
	console.log('    source            Path to package source');
	console.log('                      (cwd by default)');
	console.log();
	console.log('  Options');
	console.log('    -o, --output      Output path for .ts files');
	console.log('                      (cwd by default)');
	console.log('    -h, --help        Display help information');
	console.log();
	process.exit(0);
}


// CLI execution mainline

const opts = minimist(process.argv.slice(2), {
	string: ['output'],
	default: {output: '.'},
	alias: {o: 'output', h: 'help'}
});

if (opts.help) displayHelp();

jsdocToTs({
	package: opts._[0] || '.',
	output: fs.writeFileSync,
	ignore: ['node_modules', 'ilib', 'build', 'dist', 'samples', 'coverage', 'tests'],
	importMap: {
		core: '@enact/core',
		ui: '@enact/ui',
		spotlight: '@enact/spotlight',
		i18n: '@enact/i18n',
		webos: '@enact/webos',
		moonstone: '@enact/moonstone',
		'moonstone-ez': '@enact/moonstone-ez',
		agate: '@enact/agate',
		sandstone: '@enact/sandstone'
	},
	outputPath: opts.output
});
