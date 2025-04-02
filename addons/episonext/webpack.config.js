const path = require('path');
const fs = require('fs');

// Get all JS files from src/main/js
const jsDir = path.resolve(__dirname, 'src/main/js');
const entryFiles = {};

// Read all JS files in the directory
if (fs.existsSync(jsDir)) {
  fs.readdirSync(jsDir).forEach(file => {
    if (file.endsWith('.js')) {
      const name = file.replace('.js', '');
      entryFiles[name] = path.resolve(jsDir, file);
    }
  });
}

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    server: path.resolve(__dirname, 'src/main/js/server.js'),
    ...entryFiles
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  externals: [
    // Add any native node modules that shouldn't be bundled
    'electron',
    'express',
    'cors',
    'stremio-addon-sdk'
  ],
  node: {
    __dirname: false,
    __filename: false
  }
}; 