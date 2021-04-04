module.exports = {
  root: true,
  extends: ['@willbooster/eslint-config-ts'],
  plugins: ['svelte3'],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
  settings: {
    'svelte3/ignore-styles': (attributes) => attributes.lang === 'scss',
    'svelte3/typescript': require('typescript'),
  },
};
