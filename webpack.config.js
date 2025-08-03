import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __dirname = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url));

export default {
    entry: {
        main: path.join(__dirname, 'src/index.tsx'),
    },
    output: {
        path: path.join(__dirname, 'dist/'),
        filename: '[name].js',
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
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
            three: {
                test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
                name: 'three',
                priority: 10,
            },
            react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                priority: 20,
            },
            },
        },
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
