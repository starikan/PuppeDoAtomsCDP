const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  cache: true,
  entry: {
    main: './src/index.ts',
  },
  devtool: 'source-map',
  mode: 'production',
  target: 'node',
  node: {
    __filename: true,
    __dirname: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimize: false,
  },
  output: {
    filename: 'cdpGetSelector.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: './src/*.yaml', to: '[name].[ext]' }],
    }),
  ],
};
