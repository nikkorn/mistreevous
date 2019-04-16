module.exports = {
  entry: './src/index.js',
  output: {
    filename: './dist/index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
};