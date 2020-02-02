const path = require('path');

let dir = __dirname.replace("src",'build');

module.exports = {
  watch: true,
  entry: "./controller/controller",
  mode: 'development',
  module: {
    rules: [
      {
        use: "ts-loader",
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  output: {
    path: path.resolve(dir),
    filename: "bundle.js"
  }
};
