const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const { DuplicatesPlugin } = require("inspectpack/plugin")
const { StatsWriterPlugin } = require("webpack-stats-plugin")

module.exports = {
  entry: {
    index: './src/dist.ts',
    page: './src/index.tsx'
  },
  output: {
    path: path.join(__dirname, 'lib'),
    filename: '[name].cjs',
    chunkFilename: '[name].cjs',
    libraryTarget: 'umd',
    publicPath: '/lib/',
    umdNamedDefine: true
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
    })
  ],
  module: {
    rules: [{
      test: /\.svg$/,
      loader: 'svg-url-loader',
      options: { noquotes: true }
    },  {
      test: /\.css$/,
      use: ['css-loader']
    }, {
      test: /\.less$/,
      use: ['ignore-loader']
    }, {
      test: /\.(png|jpe?g|gif)$/i,
      use: [{
        loader: 'url-loader',
        options:{
          limit: Infinity
        }
      }]
    }, {
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
    }, {
      test: /(?<!\.d)\.tsx?$/,
      use: 'ts-loader',
      exclude: /(node_modules|bower_components|build)/
    }]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.jsx', '.js', '.json' ],
    modules: ['node_modules', './src/']
  },
  externals: {
    '@navikt/ds-react': {
      commonjs: '@navikt/ds-react',
      commonjs2: '@navikt/ds-react',
      amd: '@navikt/ds-react',
      root: '@navikt/ds-react'
    },
    '@navikt/ds-icons': {
      commonjs: '@navikt/ds-icons',
      commonjs2: '@navikt/ds-icons',
      amd: '@navikt/ds-icons',
      root: '@navikt/ds-icons'
    },
    '@navikt/ds-css': {
      commonjs: '@navikt/ds-css',
      commonjs2: '@navikt/ds-css',
      amd: '@navikt/ds-css',
      root: '@navikt/ds-css'
    },
    classnames: {
      commonjs: 'classnames',
      commonjs2: 'classnames',
      amd: 'classnames',
      root: 'classnames'
    },
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_'
    },
    md5: {
      commonjs: "md5",
      commonjs2: "md5",
      amd: "md5",
      root: "md5"
    },
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM'
    },
  }
}
