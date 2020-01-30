const micromatch = require('micromatch');
const path = require('path');

module.exports = {
  './{packages/*/,}{src,__tests__}/**/*.{js,jsx,ts,tsx}': ['eslint --fix'],
  './**/*.{css,htm,html,js,json,jsx,md,scss,ts,tsx,vue,yaml,yml}': files => {
    files = micromatch.not(files, './{packages/*/,}{src,__tests__}/**/*.{js,jsx,ts,tsx}');
    const filteredFiles = files.filter(file => !file.includes('/test-fixtures/')).map(file => path.relative('', file));
    if (filteredFiles.length === 0) return [];
    const commands = [`prettier --write ${filteredFiles.join(' ')}`];
    if (filteredFiles.some(file => file.endsWith('package.json'))) {
      commands.push('yarn sort-package-json');
    }
    return commands;
  },
};
