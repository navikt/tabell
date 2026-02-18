const { merge } = require("webpack-merge");
const common = require("./webpack.common.cjs");

module.exports = merge(common, {
  mode: "production",
  devtool: "source-map",
  output: {
    filename: "index.cjs",
    libraryTarget: "commonjs2",
  },
  externalsType: "commonjs",
});
