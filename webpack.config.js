const path = require('path');
const webpack = require('webpack');
// 环境
var ENV = process.env.NODE_ENV || 'development';
// 压缩
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
// 模版
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 合并
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// 拷贝
const CopyWebpackPlugin = require('copy-webpack-plugin');
// 监控
const DashboardPlugin = require('webpack-dashboard/plugin');
// 文件路径
const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, 'src');
const BUILD_PATH = path.resolve(ROOT_PATH, 'dist');
const NODE_MODULES_PATH = path.resolve(ROOT_PATH, 'node_modules');

const config = {
	// 源码调试'source-map'
	devtool: ENV === 'develop' ? 'source-map' : false,
	// 将库的对象挂靠在全局对象中，
	// 通过另外一个对象存储对象名以及映射到对应模块名的变量，
	// 直接在html模版里使用库的CDN文件
	// 从输出的 bundle 中排除依赖
	externals: {
		jquery: 'window.jQuery',
		react: 'React',
		'react-dom': 'ReactDOM',
		// 		'echarts': 'window.echarts',
		//     	'react-router': 'ReactRouter',
		//     	'redux': 'Redux',
		//     	'react-redux': 'ReactRedux',
		//     	'react-router-redux':'ReactRouterRedux'
	},
	// 指定根目录
	context: ROOT_PATH,
	// 入口
	entry: {
		example: './src/page/example/app',
		index: './src/page/index/app',
		// vendor: ['babel-polyfill'],
	},
	// 出口
	output: {
		filename: '[name].[chunkHash:5].js',
		// 指定非入口块文件输出的名字，动态加载的模块
		chunkFilename: '[name].bundle.js',
		path: BUILD_PATH,
		publicPath: '',
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
		},
	},
	// 模块
	module: {
		rules: [
			{
				test: /\.(js|jsx)(\?.+)?$/,
				use: [
					{
						loader: 'babel-loader',
						options: {cacheDirectory: true},
					},
				],
				include: [APP_PATH],
				exclude: [NODE_MODULES_PATH],
			},
			{
				test: /\.(css|less)(\?.+)?$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: ['css-loader', 'postcss-loader', 'less-loader'],
				}),
			},
			{
				test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
					},
				},
			},
		],
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
				secure: false,
			},
		},
		overlay: {
			warnings: true,
			errors: true,
		},
	},
	// 插件
	plugins: [
		// 从js文件中分离css出来
		new ExtractTextPlugin('[name].css'),
		new HtmlWebpackPlugin({
			title: '举个栗子',
			filename: './example.html',
			template: './src/assets/template/example.html',
			chunks: [
				'example',
				// 'vendor', 'runtime'
			],
		}),
		new HtmlWebpackPlugin({
			title: '首页',
			filename: './index.html',
			template: './src/assets/template/index.html',
			chunks: [
				'index',
				// 'vendor', 'runtime'
			],
		}),
		// 设置全局变量,无法从bundle里移除，也会打包进去
		// new webpack.ProvidePlugin({
		// 	$: 'jquery',
		// 	jQuery: 'jquery'
		// }),
		// 公共模块抽取, runtime可以是chunkhash保持不变
		// new webpack.optimize.CommonsChunkPlugin({
		// 	name: ['vendor', 'runtime'],
		// }),
		// 定义全局变量,打包时替换
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': '"production"',
			PRODUCTION: JSON.stringify(true),
		}),
		// 减少闭包函数数量从而加快js执行速度
		new webpack.optimize.ModuleConcatenationPlugin(),
	],
};
if (ENV !== 'production') {
	// 监控
	config.plugins.push(
		new DashboardPlugin({
			minified: false,
			gzip: false,
		})
	);
} else {
	// 复制
	config.plugins.push(new CopyWebpackPlugin([{from: './data.json', to: 'data.json'}]));
	// 压缩
	config.plugins.push(new UglifyJSPlugin());
	// 将 bundle 拆分成更小的 chunk
	config.plugins.push(
		new webpack.optimize.AggressiveSplittingPlugin({
			minSize: 30720, // 字节，分割点。默认：30720
			maxSize: 51200, // 字节，每个文件最大字节。默认：51200
			chunkOverhead: 0, // 默认：0
			entryChunkMultiplicator: 1, // 默认：1
		})
	);
	config.recordsOutputPath = path.join(__dirname, 'dist', 'records.json');
}
module.exports = config;
