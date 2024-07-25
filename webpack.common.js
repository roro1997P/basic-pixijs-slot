const path = require('path');

//Plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')

const pkg = require('./package.json');
const gameName = JSON.stringify(pkg.name);

var outputPath = './build';

module.exports = {
    entry: {
        app: ['./src/Main.ts']
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, outputPath),
        filename: 'js/app.js'
    },
    performance: {
        hints: false
    },
    plugins: [
        new CleanWebpackPlugin({ cleanAfterEveryBuildPatterns: outputPath }),
        new CopyWebpackPlugin({
            patterns: [
                { context: 'src/resources', from: '**/*', to: './assets/' },
            ]
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './public/index.html',
            filename: 'index.html',
            minify: {
                removeComments: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
                collapseWhitespace: true
            },
            title: gameName.replace(/\-/g, ' ').replace(/\"/g, '').replace(/\b[a-z]/g, (char) => { return char.toUpperCase() }),
        }),
        // new webpack.ProvidePlugin({
        //     $: 'jquery',
        // })
    ],
};