const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const { koaBody } = require("koa-body");
const logger = require("koa-logger");
const parameter = require("koa-parameter");
const index = require("./src/routes/index");
const users = require("./src/routes/users");
const home = require("./src/routes/home");
const path = require("path");

// 引入数据库
const mongoose = require("mongoose");
const { connectionStr } = require("./config");
mongoose.connect(connectionStr, () => {
  console.log("MongoDB连接成功！");
});
mongoose.connection.on("error", console.error);

// error handler
onerror(app);

// middlewares
app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, "./pubilc/uploadImg"),
      keepExtensions: true,
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
// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
