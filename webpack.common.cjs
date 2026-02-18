const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const { DuplicatesPlugin } = require("inspectpack/plugin")
const { StatsWriterPlugin } = require("webpack-stats-plugin")

module.exports = {
  entry: {
    index: './src/dist.ts',
  },
  output: {
    path: path.join(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: 'module',
  },
  experiments: {
    outputModule: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [{
        from: 'src/index.d.ts',
        to: 'index.d.ts'
      }]
    }),
    new DuplicatesPlugin({
      emitErrors: true,
      verbose: true
    }),
  ],
  module: {
    rules:
    [
      {
        test: /\.svg$/,
        loader: 'svg-url-loader',
        options: { noquotes: true }
      },
      {
        test: /\.module\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              esModule: true,
              modules: {
                exportOnlyLocals: false,
                mode: "local",
                namedExport: false,
                auto: true,
                exportLocalsConvention: "asIs",
                localIdentName: "[local]_[hash:base64:5]",
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: [
          "style-loader",
          "css-loader",
        ],
      },
      {
        test: /\.less$/,
        use: ['ignore-loader']
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [{
          loader: 'url-loader',
          options:{
            limit: Infinity
          }
        }]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|build)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              '@babel/transform-react-jsx',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-export-namespace-from'
            ]
          }
        }
      },
      {
        test: /(?<!\.d)\.tsx?$/,
        use: 'ts-loader',
        exclude: /(node_modules|bower_components|build)/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.jsx', '.js', '.json' ],
    modules: ['node_modules', './src/']
  },
  externals: [
    '@navikt/ds-react',
    '@navikt/ds-icons',
    '@navikt/ds-css',
    'classnames',
    'lodash',
    'md5',
    'react',
    'react-dom'
  ]
}
