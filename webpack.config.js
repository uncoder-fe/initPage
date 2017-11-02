
const webpack = require("webpack");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const path = require("path");
const ROOT_PATH = path.resolve(__dirname);
const APP_PATH = path.resolve(ROOT_PATH, "src");
const BUILD_PATH = path.resolve(ROOT_PATH, "dist");

module.exports = {
	// 源码调试"source-map"
	devtool: 'source-map' || false,
	// 将库的对象挂靠在全局对象中，
	// 通过另外一个对象存储对象名以及映射到对应模块名的变量，
	// 直接在html模版里使用库的CDN文件
	// 从输出的 bundle 中排除依赖
	externals: {
		"jquery": "window.jQuery",
		"react": "React",
		"react-dom": "ReactDOM",
	},
	// 入口
	entry: {
		example: "./src/page/example/app",
		index: "./src/page/index/app",
		// vendor: ["babel-polyfill"]
	},
	// 出口
	output: {
		filename: "[name].[hash:5].js",
		// 指定非入口块文件输出的名字
		chunkFilename: "[name].bundle.js",
		path: BUILD_PATH,
		publicPath: ""
	},
	// 模块
	module: {
		rules: [
			{
				test: /\.js(\?.+)?$/,
				use: [
					{ loader: "babel-loader", options: { cacheDirectory: true } }
				],
				include: [path.resolve("src")],
				exclude: /node_modules/
			},
			{
				test: /\.(css|less)(\?.+)?$/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: [
						"css-loader",
						"postcss-loader",
						"less-loader"
					]
				})
			},
			{
				test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
				use: {
					loader: "url-loader",
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
		host: "0.0.0.0",
		port: 9000,
		contentBase: BUILD_PATH,
		publicPath: "/",
		proxy: {
			"/api/*": {
				changeOrigin: true,
				target: "http://www.xxxx.com",
				secure: false
			}
		},
		overlay: {
			warnings: true,
			errors: true
		}
	},
	// 插件
	plugins: [
		// 合并css
		new ExtractTextPlugin('[name].css'),
		// 设置全局变量,无法从bundle里移除，也会打包进去
		new webpack.ProvidePlugin({
			// $: "jquery",
			// jQuery: "jquery"
		}),
		// 公共模块抽取
		// new webpack.optimize.CommonsChunkPlugin({
		// 	name: "vendor"
		// }),
		new HtmlWebpackPlugin({
			title: "举个栗子",
			filename: "./example.html",
			template: "./src/assets/example.html",
			chunks: ["example"]
		}),
		new HtmlWebpackPlugin({
			title: "首页",
			filename: "./index.html",
			template: "./src/assets/index.html",
			chunks: ["index"]
		}),
		// 压缩
		// new UglifyJSPlugin({
		//     compress: {
		//       warnings: false,
		//       drop_console: true,
		//       pure_funcs: ["console.log"]
		//     },
		//     sourceMap: false
		// }),
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production")
			}
		})
	]
};
