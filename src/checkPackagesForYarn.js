const fs = require("fs").promises;

const chalk = require("chalk");
const semver = require("semver");
const cleanVersion = require("./cleanVersion.js");
const axios = require("axios");

async function checkPackagesForYarn(packages) {
  const deprecatedPackages = [];
  const majorUpdates = [];

  for (const pkg of packages) {
    try {
      const response = await axios.get(
        `https://registry.yarnpkg.com/${pkg.name}`
      );
      const data = response.data;
      const latestVersion = data["dist-tags"].latest;
      const cleanedVersion = cleanVersion(pkg.version);

      if (data.versions[latestVersion].deprecated) {
        deprecatedPackages.push({
          name: pkg.name,
          version: pkg.version,
          latestVersion,
          reason: data.versions[latestVersion].deprecated,
          updateType: chalk.red,
        });
      } else if (semver.major(latestVersion) > semver.major(cleanedVersion)) {
        majorUpdates.push({
          name: pkg.name,
          version: cleanedVersion,
          latestVersion,
          reason: "Major update available",
          updateType: chalk.red,
        });
      }
    } catch (err) {
      console.error(`Error checking ${pkg.name}:`, err.message);
    }
  }

  return {
    deprecated: deprecatedPackages,
    major: majorUpdates,
  };
}

module.exports = checkPackagesForYarn;
