import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __dirname = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));

export default {
    entry: {
        index: path.join(__dirname, 'src/index.tsx'),
    },
    output: {
        path: path.join(__dirname, 'dist/'),
        filename: 'index.js',
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
            '@components': path.resolve(__dirname, 'src/components'),
        },
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.html$/,
                use: { loader: 'html-loader' },
            },
        ],
    },
    plugins: [new MiniCssExtractPlugin()],
    optimization: {
        runtimeChunk: false,
        splitChunks: false,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },
};
