const config = require('./webpack.config');
const { merge } = require('webpack-merge');

module.exports = merge(config, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: ['./dist', './assets'],
    port: 3000
  }
});