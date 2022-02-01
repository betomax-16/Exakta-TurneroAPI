const Dotenv = require('dotenv-webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
    // Use env.<YOUR VARIABLE> here:
    // webpack --env goal=local
    console.log('Goal: ', env.goal); // 'local'
    console.log('Production: ', env.production); // true
    // webpack --mode=development
    console.log('Arg: ', argv.mode);

    return {
        entry: './src/index.ts',
        mode: argv.mode,
        target: 'node',
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: 'index.js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        module: {
            rules: [
              {
                test: /\.ts$/,
                use: [
                  'ts-loader',
                ]
              }
            ]
        },
        externals: [ nodeExternals() ],
        externalsPresets: {
            node: true 
        },
        plugins: [
            new CleanWebpackPlugin(),
            new CopyPlugin({
                patterns: [
                    { context: './src', from: "public", to: "static" },
                    { context: '.', from: "swagger", to: "swagger" }
                ],
            }),
            new Dotenv({
                path: `./${argv.mode}.env`
            })
        ],
        devServer: {
            static: './build',
            hot: true,
        }
    }
};