const fs = require('fs').promises;

async function getPackageList(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const json = JSON.parse(content);
  const dependencies = Object.keys(json.dependencies || {}).map((name) => ({
    name,
    version: json.dependencies[name],
  }));
  return dependencies;
}

module.exports = getPackageList;
