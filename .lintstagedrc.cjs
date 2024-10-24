const fs = require('fs');
const path = require('path');
const micromatch = require('micromatch');

module.exports = {
  './{scripts,src,tests}/**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}': [
    'node node_modules/.bin/eslint --fix',
    'node node_modules/.bin/prettier --cache --write',
  ],
  './**/*.{cjs,css,cts,htm,html,js,json,json5,jsonc,jsx,md,mjs,mts,scss,ts,tsx,vue,yaml,yml}': (files) => {
    let filteredFiles = files.filter((file) => !file.includes('/test-fixtures/') && !file.includes('/packages/'));

    filteredFiles = filteredFiles.map((file) => path.relative('', file));
    filteredFiles = micromatch.not(filteredFiles, './{scripts,src,tests}/**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}');
    filteredFiles = filteredFiles.map((file) => path.resolve(file));
    if (filteredFiles.length === 0) return [];
    const commands = [`node node_modules/.bin/prettier --cache --write ${filteredFiles.join(' ')}`];
    if (filteredFiles.some((file) => file.endsWith('package.json'))) {
      commands.push('node node_modules/.bin/sort-package-json');
    }
    return commands;
  },
  './**/migration.sql': (files) => {
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('Warnings:')) {
        return [
          `!!! Migration SQL file (${path.relative('', file)}) contains warnings !!! Solve the warnings and commit again.`,
        ];
      }
    }
    return [];
  },
};
