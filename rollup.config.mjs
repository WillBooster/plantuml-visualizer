import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

const extensions = ['.mjs', '.js', '.json', '.ts'];

const plugins = [
  resolve({ extensions }),
  commonjs(),
  svelte({ include: 'src/**/*.svelte', preprocess: sveltePreprocess(), emitCss: false }),
  babel({ extensions, babelHelpers: 'bundled', exclude: 'node_modules/**' }),
];
if (process.env.NODE_ENV === 'production') plugins.push(terser());

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
