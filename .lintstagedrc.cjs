const micromatch = require('micromatch');

module.exports = {
  './{scripts,src,tests}/**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}': [
    'node node_modules/.bin/eslint --fix',
    'node node_modules/.bin/prettier --cache --write',
  ],
  './**/*.{cjs,css,cts,htm,html,js,json,json5,jsx,md,mjs,mts,scss,ts,tsx,vue,yaml,yml}': (files) => {
    files = micromatch.not(files, './{scripts,src,tests}/**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}');
    const filteredFiles = files.filter((file) => !file.includes('/test-fixtures/') && !file.includes('/packages/'));
    if (filteredFiles.length === 0) return [];
    const commands = [`node node_modules/.bin/prettier --cache --write ${filteredFiles.join(' ')}`];
    if (filteredFiles.some((file) => file.endsWith('package.json'))) {
      commands.push('node node_modules/.bin/sort-package-json');
    }
    return commands;
  },
};
