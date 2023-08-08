import axios from 'axios';
import semver from 'semver';
import cleanVersion from './cleanVersion.js';

async function checkDeprecatedForNpm(packages) {
  const deprecatedPackages = [];
  const majorUpdatePackages = [];

  for (const pkg of packages) {
    const { name, version } = pkg;
    const cleanedVersion = cleanVersion(version);

    if (typeof cleanedVersion !== 'string') {
      console.error(
        `Error checking ${name}: Invalid version type. Expected a string, got ${typeof cleanedVersion}.`
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

      if (!response.data.versions[cleanedVersion]) {
        console.error(
          `Error checking ${name}: Version ${cleanedVersion} not found in npm registry.`
        );
        continue;
      }

      if (response.data.versions[cleanedVersion].deprecated) {
        deprecatedPackages.push({
          name: name,
          version: cleanedVersion,
          latestVersion: latestVersion,
          reason: response.data.versions[cleanedVersion].deprecated,
        });
      }

      if (
        semver.lt(cleanedVersion, latestVersion) &&
        semver.diff(cleanedVersion, latestVersion) === 'major'
      ) {
        majorUpdatePackages.push({
          name: name,
          version: cleanedVersion,
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
