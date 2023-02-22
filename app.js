const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const { koaBody } = require("koa-body");
const koaStatic = require("koa-static");
const logger = require("koa-logger");
const parameter = require("koa-parameter");
const index = require("./src/routes/index");
const users = require("./src/routes/users");
const home = require("./src/routes/home");
const topic = require("./src/routes/topic");
const question = require("./src/routes/question");
const answer = require("./src/routes/answers");
const comment = require("./src/routes/comment");
const path = require("path");
var cors = require("koa2-cors");

// 引入数据库
const mongoose = require("mongoose");
const { connectionStr } = require("./config");
mongoose.connect(connectionStr, () => {
  console.log("MongoDB连接成功！");
});
mongoose.connection.on("error", console.error);

// 处理CORS
app.use(cors());
//或者
// app.use(
//     cors({
//         origin: function(ctx) { //设置允许来自指定域名请求
//             if (ctx.url === '/test') {
//                 return '*'; // 允许来自所有域名请求
//             }
//             return 'http://localhost:8080'; //只允许http://localhost:8080这个域名的请求
//         },
//         maxAge: 5, //指定本次预检请求的有效期，单位为秒。
//         credentials: true, //是否允许发送Cookie
//         allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
//         allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
//         exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
//     })
// );

app.use(koaStatic(path.join(__dirname, "uploadImg")));
// error handler
onerror(app);

// middlewares
app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, "/uploadImg"),
      keepExtensions: true,
      onError(err) {
        console.log(err);
      },
    },
  })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));

app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 参数校验
app.use(parameter(app));

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(home.routes(), home.allowedMethods());
app.use(topic.routes(), topic.allowedMethods());
app.use(question.routes(), question.allowedMethods());
app.use(answer.routes(), answer.allowedMethods());
app.use(comment.routes(), comment.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
