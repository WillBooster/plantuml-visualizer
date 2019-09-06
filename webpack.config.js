const ClosurePlugin = require('closure-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.ts',
    content_scripts: './src/content_scripts.ts',
  },
  target: 'web',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  module: {
    rules: [{test: /\.tsx?$/, loader: 'ts-loader'}],
  },
  optimization: {
    minimize: false,
    minimizer: [
      new ClosurePlugin({mode: 'STANDARD'}, {}),
    ]
  },
  devtool: 'source-map',
};
