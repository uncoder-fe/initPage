# 克隆项目

```bash
git clone git@github.com:uncoder-/initPage.git
```
# 安装依赖

```bash
yarn
```
# 运行

```bash
yarn start
```

# 打开浏览器

```
http://localhost:9000/example.html#/
```
# webpack
- externals消除库的依赖，使用cdn来缩小体积
- proxy本地请求代理转发
- webpack插件
1. UglifyJSPlugin(压缩)
2. HtmlWebpackPlugin(模版)
3. ExtractTextPlugin(css合并)
4. DashboardPlugin(bundle文件分析监控)
5. CommonsChunkPlugin（抽取公共模块，根据内容生成hash）


