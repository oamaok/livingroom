const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

let currentId = 0
let cssIds = {}
const getCssId = (path, localName) => {
  const key = path + localName
  cssIds[key] = cssIds[key] || currentId++
  return '_' + cssIds[key].toString(36)
}

module.exports = {
  mode: process.env.NODE_ENV,
  watch: process.env.NODE_ENV === 'development',
  entry: ['./client/index.tsx', './client/reset.scss'],
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                getLocalIdent: (context, _, localName) =>
                  getCssId(context.resourcePath, localName),
              },
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
  optimization: {
    minimize: process.env.NODE_ENV !== 'development',
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  },
  devtool: false,
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
}
