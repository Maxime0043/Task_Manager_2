const { resolve } = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./src/index.ts",
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "index.bundle.js",
    path: resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  optimization: {
    emitOnErrors: false,
  },
  externals: [nodeExternals()],
  watch: true,
  target: "node",
  mode: "production", // development | production
};
