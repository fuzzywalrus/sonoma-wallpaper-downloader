const path = require('path');

module.exports = {
  entry: {
    app: './js/app.js',
    background: './js/background.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/[name].js',
  },
};
