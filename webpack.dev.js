const webpack = require('webpack');
const { merge } = require('webpack-merge');
const CommonConfig = require('./webpack.common.js');

//Plugins
const OpenBrowserPlugin = require('./open-browser-plugin.js');

const PORT = 8085;

module.exports = merge(CommonConfig, {
    mode: "development",
    devServer: {
        host: '0.0.0.0',
        port: PORT,
        compress: true,
        historyApiFallback: true,
        client: {
            overlay: false,
        },
		allowedHosts: "all"
    },
    devtool: 'inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            FORCE_WIN: false
        }),
        new OpenBrowserPlugin({
            url: `http://localhost:${PORT}`
        })
    ]
})