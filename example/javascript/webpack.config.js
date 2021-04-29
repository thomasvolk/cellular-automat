const path = require('path');

module.exports = {
  entry: './src/index.js',
  resolve: {
    extensions: ['.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  }
};