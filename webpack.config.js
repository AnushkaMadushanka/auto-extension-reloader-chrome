var path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')

const copyWebpackPlugin = new CopyWebpackPlugin([
    {
        from: './app/index.html',
        to: './index.html',
    },
    {
        from: './manifest.json',
        to: './manifest.json',
    },
    {
        from: './public',
        to: './public',
    }
])

module.exports = {
    entry: {
        app: './app/index.js',
        content: './scripts/content.js',
        background: './scripts/background.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'scripts/[name].js'
    },
    module: {
        rules: [
            { test: /\.(js)$/, use: 'babel-loader' },
            {
                test: /\.css$/, use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: "[name]__[local]___[hash:base64:5]",
                            },
                            importLoaders: 1,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: [
                                require('autoprefixer')({}),
                                require('cssnano')({ preset: 'default' })
                            ],
                            minimize: true
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|ico|eot|ttf|woff|woff2)?(\?v=\d+.\d+.\d+)?$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        publicPath: '/'
                    }
                },
            },
            {
                test: /\.svg$/,
                use: [
                    { loader: 'babel-loader', },
                    { loader: 'svg-react-loader' },
                ],
            }
        ]
    },
    mode: 'production',
    plugins:[copyWebpackPlugin]
}