const path = require('path')
const webpack = require('webpack')

// 压缩
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
// 模版
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 合并
const ExtractTextPlugin = require('extract-text-webpack-plugin')
// 监控
const Dashboard = require('webpack-dashboard')
const DashboardPlugin = require('webpack-dashboard/plugin')
// 文件路径
const ROOT_PATH = path.resolve(__dirname)
const APP_PATH = path.resolve(ROOT_PATH, 'src')
const BUILD_PATH = path.resolve(ROOT_PATH, 'dist')

module.exports = {
	// 源码调试'source-map'
	devtool: 'source-map',
	// 将库的对象挂靠在全局对象中，
	// 通过另外一个对象存储对象名以及映射到对应模块名的变量，
	// 直接在html模版里使用库的CDN文件
	// 从输出的 bundle 中排除依赖
	externals: {
		'jquery': 'window.jQuery',
		'react': 'React',
		'react-dom': 'ReactDOM',
// 		'echarts': 'window.echarts',
//     	'react": 'React',
//     	'react-dom": 'ReactDOM',
//     	'react-router': 'ReactRouter',
//     	'redux': 'Redux',
//     	'react-redux': 'ReactRedux',
//     	'react-router-redux':'ReactRouterRedux'
	},
	// 入口
	entry: {
		example: './src/page/example/app',
		index: './src/page/index/app',
		vendor: ['babel-polyfill']
	},
	// 出口
	output: {
		filename: '[name].[chunkHash:5].js',
		// 指定非入口块文件输出的名字，动态加载的模块
		chunkFilename: '[name].bundle.js',
		path: BUILD_PATH,
		publicPath: ''
	},
	resolve: {
		// 默认主文件名称
		extensions: ['.js', '.jsx'],
		mainFiles: ['index.web', 'index']
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
				include: [path.resolve('src')],
				exclude: /node_modules/
			},
			{
				test: /\.(css|less)(\?.+)?$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						'css-loader',
						'postcss-loader',
						'less-loader'
					]
				})
			},
			{
				test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000
					}
				}
			}
		]
	},
	// server
	devServer: {
		// 防止用ip非法
		disableHostCheck: true,
		// 防止用ip找不到
		host: '0.0.0.0',
		port: 9000,
		contentBase: BUILD_PATH,
		publicPath: '/',
		quiet: true,
		proxy: {
			'/api/*': {
				changeOrigin: true,
				target: 'http://www.xxxx.com',
				secure: false
			}
		},
		// overlay: {
		// 	warnings: true,
		// 	errors: true
		// }
	},
	// 插件
	plugins: [
		// 合并css
		new ExtractTextPlugin('[name].css'),
		new HtmlWebpackPlugin({
			title: '举个栗子',
			filename: './example.html',
			template: './src/assets/example.html',
			chunks: ['example', 'vendor', 'runtime']
		}),
		new HtmlWebpackPlugin({
			title: '首页',
			filename: './index.html',
			template: './src/assets/index.html',
			chunks: ['index', 'vendor', 'runtime']
		}),
		// 设置全局变量,无法从bundle里移除，也会打包进去
		// new webpack.ProvidePlugin({
		// 	$: 'jquery',
		// 	jQuery: 'jquery'
		// }),
		// 公共模块抽取, runtime可以是chunkhash保持不变
		new webpack.optimize.CommonsChunkPlugin({
			name: ['vendor', 'runtime']
		}),
		// 压缩
		// new UglifyJSPlugin(),
		// 定义全局变量,打包时替换
		// new webpack.DefinePlugin({
		// 	NODE_ENV: JSON.stringify('production')
		// })
		// new DashboardPlugin({
		// 	port: 9000,
		// 	handler: (new Dashboard()).setData
		// })
	]
}
