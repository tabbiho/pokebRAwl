const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: ['regenerator-runtime/runtime.js', './src/index.js'],
  output: {
    filename: '[name]-[contenthash].bundle.js',
    path: path.resolve(__dirname, '../dist'),
    clean: true,
  },
  plugins: [
    new MiniCssExtractPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          'sass-loader',
        ],
      },
    ],
  },
};
