const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const isDev = process.env.NODE_ENV !== 'production';

const config = {
    mode: isDev ? 'development' : 'production',
    devtool: 'source-map',
    entry: {
        main: path.resolve(__dirname, './src/index.js'),
    },
    output: {
        filename: '[name].[hash].bundle.js',
        path: path.resolve(__dirname, './dist/'),
        assetModuleFilename: "assets/[name][ext][query]",
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg)$/,
                type: 'asset/resource',
                exclude: /images/,
                generator: {
                    filename: 'assets/fonts/[name][ext]',
                },
            },
            {
                test: /\.svg$/,
                type: 'asset/inline',
                exclude: /fonts/,
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset',
                exclude: /fonts/,
                generator: {
                    filename: 'assets/img/[name][ext]',
                },
            },
            {
                test: /\.(sa|sc|c)ss$/i,
                use: [
                    isDev ? "style-loader" : MiniCssExtractPlugin.loader,
                    "css-loader",
                    "postcss-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.(pug|jade)$/,
                loader: "pug-loader",
            },
        ],
    },

    devServer: {
        historyApiFallback: true,
        static: {
            directory: path.join(__dirname, './dist'),
        },
        open: true,
        compress: true,
        port: 9000,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        }),
        new webpack.HotModuleReplacementPlugin(),
    ].concat(isDev ? [] : [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].min.css',
            chunkFilename: '[name].[contenthash].min.css',
        }),
    ]),
};

module.exports = config;