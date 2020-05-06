import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import closureCompile from '@ampproject/rollup-plugin-closure-compiler';

const extensions = ['.mjs', '.js', '.json', '.ts'];
const plugins = [resolve({ extensions }), commonjs(), babel({ extensions, babelHelpers: 'bundled' })];
if (process.env.NODE_ENV === 'production') {
  plugins.push(closureCompile());
}

export default [
  {
    input: 'src/background.ts',
    output: [
      {
        file: 'dist/background.js',
        format: 'es',
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
      },
    ],
    plugins,
  },
];
