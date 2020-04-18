import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import closureCompile from 'rollup-plugin-closure-compile';
import typescript from 'rollup-plugin-typescript2';

const plugins = [resolve(), commonjs(), typescript()];
if (process.env.NODE_ENV === 'production') {
  plugins.push(closureCompile());
}

export default [
  {
    input: 'src/background.ts',
    output: [
      {
        file: 'dist/background.js',
        format: 'esm',
      },
    ],
    plugins,
  },
  {
    input: 'src/content_scripts.ts',
    output: [
      {
        file: 'dist/content_scripts.js',
        format: 'esm',
      },
    ],
    plugins,
  },
];
