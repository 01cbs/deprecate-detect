import { promises as fs } from 'fs';
import chalk from 'chalk';
import semver from 'semver';
import cleanVersion from './cleanVersion.js';
import axios from 'axios';

async function checkPackage(pkg) {
  try {
    const response = await axios.get(`https://registry.yarnpkg.com/${pkg.name}`);
    const data = response.data;
    const latestVersion = data['dist-tags'].latest;
    const cleanedVersion = cleanVersion(pkg.version);

    if (data.versions[latestVersion].deprecated) {
      return {
        deprecated: {
          name: pkg.name,
          version: pkg.version,
          latestVersion,
          reason: data.versions[latestVersion].deprecated,
          updateType: chalk.red,
        },
      };
    } else if (semver.major(latestVersion) > semver.major(cleanedVersion)) {
      return {
        major: {
          name: pkg.name,
          version: cleanedVersion,
          latestVersion,
          reason: 'Major update available',
          updateType: chalk.red,
        },
      };
    }
  } catch (err) {
    console.error(`Error checking ${pkg.name}:`, err.message);
  }
  return {};
}

async function checkPackagesForYarn(packages) {
  const results = await Promise.all(packages.map(checkPackage));

  const deprecatedPackages = results
    .filter((result) => result.deprecated)
    .map((result) => result.deprecated);

  const majorUpdates = results.filter((result) => result.major).map((result) => result.major);

  return {
    deprecated: deprecatedPackages,
    major: majorUpdates,
  };
}

export default checkPackagesForYarn;
