const HtmlWebPackPlugin = require("html-webpack-plugin");
const postcssPresetEnv = require("postcss-preset-env");

const htmlPlugin = new HtmlWebPackPlugin({
  template: "./preview/index.html",
  filename: "./index.html"
});

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          {
            loader: "postcss-loader",
            options: {
              ident: "postcss",
              plugins: () => [postcssPresetEnv()]
            }
          }
        ]
      }
    ]
  },
  plugins: [htmlPlugin]
};
