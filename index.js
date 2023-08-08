#!/usr/bin/env node
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const checkDeprecatedForNpm = require('./src/checkDeprecatedForNpm.js');
const checkPackagesForYarn = require('./src/checkPackagesForYarn.js');
const getPackageList = require('./src/getPackageList.js');

async function main() {
  const argv = yargs(hideBin(process.argv)).options({
    p: {
      type: 'string',
      demandOption: false,
      alias: 'path',
      description: 'Path to project directory',
      default: process.cwd(),
    },
    npm: {
      type: 'boolean',
      demandOption: false,
      description: 'Check for npm packages',
    },
    yarn: {
      type: 'boolean',
      demandOption: false,
      description: 'Check for yarn packages',
    },
    h: {
      type: 'boolean',
      demandOption: false,
      alias: 'help',
      description: 'Show help',
    },
  }).argv;

  if (argv.h) {
    yargs.showHelp();
    return;
  }

  const packagePath = path.join(argv.p, 'package.json');
  const packages = await getPackageList(packagePath);

  if (argv.npm) {
    const deprecatedNpmPackages = await checkDeprecatedForNpm(packages);
    // TODO: Print results in a user-friendly way
  }

  if (argv.yarn) {
    const results = await checkPackagesForYarn(packages);

    if (results.deprecated.length > 0 || results.major.length > 0) {
      if (results.deprecated.length > 0) {
        console.log('\nDeprecated Yarn packages found:');
        for (const pkg of results.deprecated) {
          console.log(`- ${pkg.name}@${pkg.version} -> ${pkg.latestVersion}: ${pkg.reason}`);
        }
      }

      if (results.major.length > 0) {
        console.log('\nMajor updates available:');
        for (const pkg of results.major) {
          console.log(`- ${pkg.name}@${pkg.version} -> ${pkg.latestVersion}: ${pkg.reason}`);
        }
      }
    } else {
      console.log('\nNo deprecated or major updates found for Yarn packages.');
    }
  }
}

main();
