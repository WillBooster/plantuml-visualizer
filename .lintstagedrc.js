const micromatch = require('micromatch');
module.exports = {
  './{packages/*/,}{src,__tests__}/**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'git add'],
  './**/*.{css,htm,html,js,json,jsx,md,scss,ts,tsx,vue,yaml,yml}': files => {
    files = micromatch.not(files, './{packages/*/,}{src,__tests__}/**/*.{js,jsx,ts,tsx}');
    const fileList = files.filter(file => !file.includes('/test-fixtures/')).join(' ');
    return fileList ? [`prettier --write ${fileList}`, `git add ${fileList}`] : [];
  },
};
