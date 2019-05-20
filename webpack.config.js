module.exports = {
  entry: './src/index.js',
  output: {
    filename: './dist/index.js',
    library: 'Mistreevous',
    libraryTarget: 'umd'
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