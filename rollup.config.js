import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import closureCompile from '@ampproject/rollup-plugin-closure-compiler';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

const isProduction = process.env.NODE_ENV === 'production';
const extensions = ['.mjs', '.js', '.json', '.ts'];

const plugins = [
  resolve({ extensions }),
  commonjs(),
  svelte({ dev: !isProduction, include: 'src/**/*.svelte', preprocess: sveltePreprocess() }),
  babel({ extensions, babelHelpers: 'bundled', exclude: 'node_modules/**' }),
];
if (isProduction) plugins.push(closureCompile());

export default [
  {
    input: 'src/background.ts',
    output: [
      {
        file: 'dist/background.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins,
  },
  {
    input: 'src/content_scripts.ts',
    output: [
      {
        file: 'dist/content_scripts.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins,
  },
  {
    input: 'src/popup.ts',
    output: [
      {
        file: 'dist/popup.js',
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins,
  },
];
