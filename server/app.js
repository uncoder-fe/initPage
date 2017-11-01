const Koa = require('koa');
const app = new Koa();

app.use(ctx => {
	ctx.body = 'Hello Koa';
});

app.listen(3000, () => {
	console.log("已开启localhost:3000");
});

