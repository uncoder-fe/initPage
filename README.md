# 项目运行

```bash
git clone git@github.com:uncoder-/initPage.git
// 安装依赖
yarn
// 运行
yarn start
// 打开浏览器
http://localhost:9000/example.html#/
```
# webpack相关
- externals消除库的打包依赖，使用cdn来缩小体积
- proxy本地请求代理转发
- 插件
	1. UglifyJSPlugin(压缩)
	2. HtmlWebpackPlugin(模版)
	3. ExtractTextPlugin(css合并)
	4. DashboardPlugin(bundle文件分析监控)
	5. CommonsChunkPlugin（抽取公共模块，根据内容生成hash）
	6. ModuleConcatenationPlugin减少闭包数量，提升js运行效率
# postCss相关
- 插件
	1. autoprefixer(前缀补全)
	2. cssnano(样式压缩)

