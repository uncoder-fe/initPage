const path = require('path');
const webpack = require('webpack');

// 清理
const CleanWebpackPlugin = require('clean-webpack-plugin');
// 合并
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// 模版
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 拷贝
const CopyWebpackPlugin = require('copy-webpack-plugin');
// pwa
const WorkboxPlugin = require('workbox-webpack-plugin');

// 文件路径
const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, 'dist');
const NODE_MODULES_PATH = path.resolve(ROOT_PATH, 'node_modules');

module.exports = env => {
	// 开发模式
	const devMode = process.env.WEBPACK_SERVE || env.mode !== 'production';
	console.log('开发模式::::::=>', devMode);
	// CDN配置
	let CDN_URL = '/';
	if (devMode) {
		CDN_URL = '/';
	} else {
		CDN_URL = '//xxxxxxxxxxxx.ooo/';
	}
	const config = {
		mode: devMode ? 'development' : 'production',
		// 源码调试'source-map'
		devtool: devMode ? 'source-map' : false,
		// 将库的对象挂靠在全局对象中，
		// 通过另外一个对象存储对象名以及映射到对应模块名的变量，
		// 直接在html模版里使用库的CDN文件
		// 从输出的 bundle 中排除依赖
		externals: {
			jquery: 'window.jQuery',
			react: 'React',
			'react-dom': 'ReactDOM',
			// 'echarts': 'window.echarts',
			// 'react-router': 'ReactRouter',
			// 'redux': 'Redux',
			// 'react-redux': 'ReactRedux',
			// 'react-router-redux':'ReactRouterRedux'
		},
		// 指定根目录
		context: ROOT_PATH,
		// 入口
		entry: {
			example: './src/page/example/app',
			index: './src/page/index/app'
		},
		// 出口
		output: {
			filename: 'static/js/[name].[hash:5].js',
			// 指定非入口块文件输出的名字，动态加载的模块
			chunkFilename: 'static/js/[name].bundle.js',
			path: BUILD_PATH,
			publicPath: CDN_URL
		},
		resolve: {
			// 解析模块时应该搜索的目录
			modules: [APP_PATH, 'node_modules'],
			// 自动解析确定的扩展
			extensions: ['.js', '.jsx'],
			// 优先引入的文件名
			mainFiles: ['index'],
			// 模块别名列表
			alias: {
				assets: path.join(APP_PATH, 'assets'),
				common: path.join(APP_PATH, 'common'),
				components: path.join(APP_PATH, 'components')
			}
		},
		// 模块
		module: {
			rules: [
				{
					test: /\.(js|jsx)(\?.+)?$/,
					use: [
						{
							loader: 'babel-loader',
							options: { cacheDirectory: true }
						}
					],
					include: [APP_PATH],
					exclude: [NODE_MODULES_PATH]
				},
				{
					test: /\.(css|less)(\?.+)?$/,
					use: [
						devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
						'css-loader',
						'postcss-loader',
						'less-loader'
					]
				},
				{
					test: /\.(png|jpg|jpeg|gif)(\?.+)?$/,
					use: {
						loader: 'url-loader',
						options: {
							limit: 10000,
							name: 'static/img/[name].[hash:7].[ext]'
						}
					}
				},
				{
					test: /\.(eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
					use: {
						loader: 'url-loader',
						options: {
							limit: 10000,
							name: 'static/font/[name].[hash:7].[ext]'
						}
					}
				}
			]
		},
		// 开发服务器
		devServer: {
			contentBase: '/',
			port: 9000
		},
		// 插件
		plugins: [
			new CleanWebpackPlugin(['dist']),
			new MiniCssExtractPlugin({
				filename: devMode ? 'static/css/[name].css' : 'static/css/[name].[hash].css',
				chunkFilename: devMode ? 'static/css/[id].css' : 'static/css/[id].[hash].css'
			}),
			new HtmlWebpackPlugin({
				title: '举个栗子',
				filename: './example.html',
				template: './src/assets/template/example.ejs',
				chunks: ['example'],
				CDN_URL: CDN_URL
			}),
			new HtmlWebpackPlugin({
				title: '首页',
				filename: './index.html',
				template: './src/assets/template/index.ejs',
				chunks: ['index'],
				CDN_URL: CDN_URL
			}),
			// 减少闭包函数数量从而加快js执行速度
			new webpack.optimize.ModuleConcatenationPlugin(),
			// 拷贝
			new CopyWebpackPlugin([{ from: './data.json', to: 'data.json' }, { from: './data2.json', to: 'data2.json' }]),
			// new WorkboxPlugin.GenerateSW({
			// 	swDest: 'sw.js',
			// 	skipWaiting: true,
			// 	clientsClaim: true
			// })
		]
	};
	return config;
};
