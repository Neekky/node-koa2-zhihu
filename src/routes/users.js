const jwt = require("koa-jwt");
const { secret } = require("../../config");
const router = require("koa-router")();
const users = require("../controllers/users");
const { SuccessModel, ErrorModel } = require("../models/resModel");

const auth = jwt({
  secret,
});

const authSelf = async (ctx, next) => {
  const { authorization = "" } = ctx.request.header;
  console.log(authorization, "authorization is");
  const token = authorization.replace("Bearer ", "");
  try {
    const user = jwt.verify(token, secret);
    ctx.state.user = user;
  } catch (error) {
    ctx.body = new ErrorModel({
      msg: error,
      code: 401,
    });
    return;
  }
  await next();
};

router.prefix("/users");

router.get("/", function (ctx, next) {
  ctx.body = "this is a users response!";
});

router.post("/create", users.create);

router.get("/find", users.find);

router.get("/findById/:id", users.findById);

router.patch("/update/:id", auth, users.checkOwner, users.update);

router.delete("/delete/:id", auth, users.checkOwner, users.delete);

router.post("/login", users.login);

module.exports = router;
