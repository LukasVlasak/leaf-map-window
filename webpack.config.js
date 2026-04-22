const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const tsLoaderOptions = {
  transpileOnly: true,
  compilerOptions: { rootDir: '.' },
};

const tsLoaderRule = {
  test: /\.ts$/,
  use: { loader: 'ts-loader', options: tsLoaderOptions },
  exclude: /node_modules/,
}

module.exports = (env = {}) => {
  if (env.demo) {
    return {
      mode: 'development',
      entry: './demo/index.ts',
      output: {
        path: path.resolve(__dirname, 'demo/dist'),
        filename: 'demo.js',
        clean: true,
      },
      devtool: 'inline-source-map', // pro citelny kod v devtools
      devServer: {
        static: './demo',
        open: true,
        port: 3000,
        hot: true,
      },
      resolve: {
        extensions: ['.ts', '.js'],
        alias: {
          'leaf-map-window': path.resolve(__dirname, 'src/index.ts'),
        },
      },
      module: {
        rules: [
          tsLoaderRule,
          {
            test: /\.scss$/,
            use: ['style-loader', 'css-loader', 'sass-loader'], // spousteni zprava doleva
          },
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
        ],
      },
      plugins: [
        new HtmlWebpackPlugin({ template: './demo/index.html' }),
      ],
    };
  }

  return {
    mode: 'production',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'leaf-map-window.js',
      library: {
        name: 'LeafMapWindow',
        type: 'umd',
      },
      globalObject: 'this',
      clean: true,
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        tsLoaderRule,
        {
          test: /\.scss$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    externals: {
      leaflet: {
        commonjs: 'leaflet',
        commonjs2: 'leaflet',
        amd: 'leaflet',
        root: 'L',
      },
    },
    plugins: [
      new MiniCssExtractPlugin({ filename: 'leaf-map-window.css' }),
    ],
  };
};
