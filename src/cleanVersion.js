function cleanVersion(version) {
  return version.replace("^", "");
}

module.exports = cleanVersion;
