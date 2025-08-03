import baseConfig from './webpack.config.js';
import { merge } from 'webpack-merge'; 

export default merge(baseConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: ['./dist', './assets'],
    port: 3000
  }
});