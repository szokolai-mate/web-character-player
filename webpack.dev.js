import path from 'node:path';
import baseConfig from './webpack.config.js';
import { merge } from 'webpack-merge';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));

export default merge(baseConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: ['./dist', './assets'],
        port: 3000,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src/index.html'),
            inject: 'body',
        }),
    ],
});
