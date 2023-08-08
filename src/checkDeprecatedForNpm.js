import axios from 'axios';
import semver from 'semver';
import cleanVersion from './cleanVersion.js';

async function checkDeprecatedForNpm(packages) {
  const deprecatedPackages = [];
  const majorUpdatePackages = [];

  for (const [index, pkg] of Object.entries(packages)) {
    const name = pkg.name;
    const rawVersion = pkg.version;

    const version = cleanVersion(rawVersion);

    if (typeof version !== 'string') {
      console.error(
        `Error checking ${name}: Invalid version type. Expected a string, got ${typeof version}.`
      );
      continue;
    }

    try {
      const response = await axios.get(`https://registry.npmjs.org/${name}`);
      const latestVersion = response.data['dist-tags']?.latest;

      if (!latestVersion || typeof latestVersion !== 'string') {
        console.error(`Error checking ${name}: Invalid latest version or data structure.`);
        continue;
      }

      if (!response.data.versions[version]) {
        console.error(`Error checking ${name}: Version ${version} not found in npm registry.`);
        continue;
      }

      if (response.data.versions[version].deprecated) {
        deprecatedPackages.push({
          name: name,
          version: version,
          latestVersion: latestVersion,
          reason: response.data.versions[version].deprecated,
        });
      }

      if (semver.lt(version, latestVersion) && semver.diff(version, latestVersion) === 'major') {
        majorUpdatePackages.push({
          name: name,
          version: version,
          latestVersion: latestVersion,
          reason: 'Major update available.',
        });
      }
    } catch (error) {
      console.error(`Error checking ${name}: ${error.message}`);
    }
  }

  return {
    deprecated: deprecatedPackages,
    major: majorUpdatePackages,
  };
}

export default checkDeprecatedForNpm;
