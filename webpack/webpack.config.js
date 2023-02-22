const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const EsLintWebpackPlugin = require('eslint-webpack-plugin')
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
// terser-webpack-plugin 在 webpack5 中已被内置，开箱即用无需安装
const TerserPlugin = require("terser-webpack-plugin")

// 相对路径转绝对路径
const resolvePath = _path => path.resolve(__dirname, _path)

// 获取 cross-env 环境变量
const isEnvProduction = process.env.NODE_ENV === 'production'

const getStyleLoaders = (prevLoader) => {
    return [
      // 生产环境将css单独抽取成文件，开发环境直接只用 style-loader
      isEnvProduction ? MiniCssExtractPlugin.loader : 'style-loader',
      // 开发环境缓存css文件
      !isEnvProduction && 'cache-loader',
      'css-loader',
      {
        // 处理css兼容问题
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: ['postcss-preset-env']
          }
        }
      },
      prevLoader
    ].filter(Boolean)
}

module.exports = {
  entry: resolvePath('../src/index.tsx'),
  output: {
    path: isEnvProduction ? resolvePath('../dist') : undefined,
    filename: isEnvProduction ? 'scripts/[name].[contenthash:10].js' : 'scripts/[name].js',
    chunkFilename: isEnvProduction ? 'scripts/[name].[contenthash:10].chunk.js' : 'scripts/[name].chunk.js',
    // 静态资源输出位置
    assetModuleFilename: 'assets/img/[hash:10][ext][query]',
    clean: true
  },

  module: {
    rules: [{
        oneOf: [{
            test: /\.css$/,
            use: getStyleLoaders()
          }, {
            test: /\.less$/,
            use: getStyleLoaders('less-loader')
          }, {
            test: /\.s[ac]ss$/,
            use: getStyleLoaders('sass-loader')
          }, {
            // 处理图片
            test: /\.(jpe?g|png|gif|webp|svg)$/,
            type: 'asset',
            generator: {
              filename: 'assets/img/[hash:10][ext]'
            },
            parser: {
              dataUrlCondition: {
                // 小于60kb的图片会被base64处理
                maxSize: 60 * 1024
              }
            }
          }, {
            // 处理字体资源
            test: /\.(woff2?|ttf)$/,
            // type设置为 resource 原封不动输出内容
            type: 'asset/resource'
          }, {
            test: /\.(js|jsx|ts|tsx)$/,
            // 只处理 src 下的文件，排除其他如 node_modules 的处理
            include: [resolvePath('../src'), resolvePath('../library')],
            loader: 'babel-loader',
            options: {
              // 开启babel缓存
              cacheDirectory: true,
              // 关闭缓存压缩
              cacheCompression: false,
              // 开发环境激活TSX的HMR
              plugins: [
                !isEnvProduction && 'react-refresh/babel'
              ].filter(Boolean),
            }
          }
        ]
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolvePath('../public/index.html'),
    }),
    isEnvProduction && new MiniCssExtractPlugin({
      filename: isEnvProduction ? 'css/[name].[contenthash:10].css' : 'css/[name].css',
      chunkFilename: isEnvProduction ? 'css/[name].[contenthash:10].chunk.css' : 'css/[name].chunk.css',
    }),
    new EsLintWebpackPlugin({
      context: resolvePath('../'),
      files: ['src', 'library'],
      exclude: 'node_modules',
      cache: true,
      cacheLocation: resolvePath('../node_modules/.cache/.eslintCache')
    }),
    !isEnvProduction && new ReactRefreshWebpackPlugin()
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': resolvePath('../src'),
      '@library': resolvePath('../library')
    },
    extensions: [".js", ".ts", ".jsx", ".tsx"]
  },
  
  mode: isEnvProduction ? 'production' : 'development',

  devtool: isEnvProduction ? false : 'cheap-module-source-map',

  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // react react-dom react-router-dom 一起打包
        react: {
          test: /[\\/]node_modules[\\/]react(.*)?[\\/]/,
          name:'chunk-react',
          // 优先级，打包 react 相关依赖时，不会被打入 node_modules 中的chunk
          priority: 10
        },
        // node_modules 单独打包
        lib: {
          test: /[\\/]node_modules[\\/]/,
          name:'chunk-libs',
          priority: 1
        }
      }
    },

    // 运行时的chunk文件
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`
    },

    // 是否需要开启压缩
    minimize: isEnvProduction,

    // 压缩css
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin()
    ],
  },

  devServer: {
    host: 'localhost',
    port: 3000,
    open: true,
    hot: true,
    // 使用 index.html 代替所有404页面，解决使用H5的history API刷新页面导致404的问题
    historyApiFallback: true,
  },

}
