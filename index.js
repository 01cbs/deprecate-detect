#!/usr/bin/env node
import path from 'path';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import checkDeprecatedForNpm from './src/checkDeprecatedForNpm.js';
import checkPackagesForYarn from './src/checkPackagesForYarn.js';
import getPackageList from './src/getPackageList.js';

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
    const resultsNpm = await checkDeprecatedForNpm(packages);

    if (resultsNpm.deprecated.length > 0 || resultsNpm.major.length > 0) {
      if (resultsNpm.deprecated.length > 0) {
        console.log('\nDeprecated npm packages found:');
        for (const pkg of resultsNpm.deprecated) {
          console.log(`- ${pkg.name}@${pkg.version} -> ${pkg.latestVersion}: ${pkg.reason}`);
        }
      }

      if (resultsNpm.major.length > 0) {
        console.log('\nMajor updates available for npm packages:');
        for (const pkg of resultsNpm.major) {
          console.log(`- ${pkg.name}@${pkg.version} -> ${pkg.latestVersion}: ${pkg.reason}`);
        }
      }
    } else {
      console.log('\nNo deprecated or major updates found for npm packages.');
    }
  }

  if (argv.yarn) {
    const resultsYarn = await checkPackagesForYarn(packages);

    if (resultsYarn.deprecated.length > 0 || resultsYarn.major.length > 0) {
      if (resultsYarn.deprecated.length > 0) {
        console.log('\nDeprecated Yarn packages found:');
        for (const pkg of resultsYarn.deprecated) {
          console.log(`- ${pkg.name}@${pkg.version} -> ${pkg.latestVersion}: ${pkg.reason}`);
        }
      }

      if (resultsYarn.major.length > 0) {
        console.log('\nMajor updates available:');
        for (const pkg of resultsYarn.major) {
          console.log(`- ${pkg.name}@${pkg.version} -> ${pkg.latestVersion}: ${pkg.reason}`);
        }
      }
    } else {
      console.log('\nNo deprecated or major updates found for Yarn packages.');
    }
  }
}

main();
