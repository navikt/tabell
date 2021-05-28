const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const { DuplicatesPlugin } = require("inspectpack/plugin")

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  entry: {
    index: './src/dist.ts'
  },
  output: {
    path: path.join(__dirname, 'lib'),
    filename: '[name].js',
    chunkFilename: '[name].js',
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
      test: /\.less$/,
      use: ['ignore-loader']
    }, {
      test: /\.css$/,
      use: ['css-loader']
    }, {
      test: /\.svg$/,
      loader: 'svg-url-loader',
      options: { noquotes: true }
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
    }, {
      test: /\.d\.ts$/,
      loader: 'ignore-loader'
    }]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.jsx', '.js', '.json' ],
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      assets: path.resolve(__dirname, 'assets')
    },
    modules: ['node_modules', './src/']
  },
  externals: {
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_'
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
    "styled-components": {
      commonjs: "styled-components",
      commonjs2: "styled-components",
      amd: "styled-components",
    }
  }
}
