#!/usr/bin/env node

/* eslint-disable no-console */

'use strict';

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const jsdocToTs = require('..');

// Uncaught error handler
process.on('uncaughtException', err => console.error(err.stack));

function displayHelp () {
	let e = 'node ' + path.relative(process.cwd(), __filename);
	if (require.main !== module) e = 'jsdoc-to-ts';

	console.log('  jsdoc-to-ts v' + require('../package.json').version);
	console.log();
	console.log('  Usage');
	console.log(`    ${e} [options]`);
	console.log();
	console.log('  Options');
	console.log('    -b, --base        NPM install root level package');
	console.log('                      (enabled by default)');
	console.log('    -s, --sampler     NPM install sampler package');
	console.log('                      (enabled by default)');
	console.log('    -a, --allsamples  NPM install all sample packages');
	console.log('    -l, --link        After install, attempt to link any available');
	console.log('                      enact-scoped dependencies');
	console.log('    --loglevel        NPM log level to output');
	console.log('    --verbose         Verbose output logging');
	console.log('    -v, --version     Display version information');
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
	ignore: ['node_modules', 'ilib', 'build'],
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
