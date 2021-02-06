const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
    // Entry points to the project
    entry: {
        main: [
            // only- means to only hot reload for successful updates
            'webpack/hot/only-dev-server',
            './src/App.js',
        ],
    },
    // Server Configuration options
    devServer: {
        contentBase: 'build', // Relative directory for base of server
        hot: true, // Live-reload
        inline: true,
        port: 4000, // Port Number
        host: 'localhost', // Change to '0.0.0.0' for external facing server
    },
    devtool: 'eval',
    output: {
        path: path.resolve(__dirname, 'build'), // Path of output file
        filename: 'app.bundle.js',
    },
    plugins: [
        // Enables Hot Modules Replacement
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve('./build/index.html'),
          }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ["es2015", "react", "stage-2"],
                    cacheDirectory: true,
                },
            },
            {
                test: /\.(png|jpg)$/,
                use: [
                  {
                    loader: 'url-loader',
                    options: {
                      limit: 4000000 // 40 kB
                    }
                  }
                ]
            },
        ],
    },
};

module.exports = config;
