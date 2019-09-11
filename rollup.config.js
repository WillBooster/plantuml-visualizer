import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import closureCompile from 'rollup-plugin-closure-compile';

const plugins = [resolve(), commonjs()];
if (process.env.NODE_ENV === 'production') {
  plugins.push(closureCompile());
}

export default [
  {
    input: 'dist/tsc/background.js',
    output: [
      {
        file: 'dist/esm/background.js',
        format: 'esm',
      },
    ],
    plugins
  },
  {
    input: 'dist/tsc/content_scripts.js',
    output: [
      {
        file: 'dist/esm/content_scripts.js',
        format: 'esm',
      },
    ],
    plugins
  },
];
