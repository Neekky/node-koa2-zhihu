const jwt = require("jsonwebtoken");
const User = require("../models/users");
const { secret } = require("../../config");
const { SuccessModel, ErrorModel } = require("../models/resModel");

const codeMap = {
  noUser: 100010, // 用户不存在
  conflict: 100409, // 冲突
  unCorrect: 100401, // 数据错误
};

class UsersCtl {
  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "string", required: true },
    });
    const { name } = ctx.request.body;
    const repeatedUser = await User.findOne({ name });
    if (repeatedUser) {
      ctx.body = new ErrorModel({
        msg: "用户名已存在",
        code: codeMap.conflict,
      });
      return;
    }
    const data = await new User(ctx.request.body).save();
    ctx.body = new SuccessModel({ data });
  }

  async find(ctx) {
    const data = await User.find();
    ctx.body = new SuccessModel({ data });
  }

  async findById(ctx) {
    const data = await User.findById(ctx.params.id);
    if (!data) {
      ctx.body = new ErrorModel({
        data,
        msg: "用户不存在",
        code: codeMap.noUser,
      });
      return;
    }
    ctx.body = new SuccessModel({ data, msg: "查找成功" });
  }

  async checkOwner(ctx, next) {
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.body = new ErrorModel({
        msg: "该用户没有权限",
        code: 403,
      });
      return;
    }
    await next();
  }

  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      password: { type: "string", required: false },
    });
    const data = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    if (!data) {
      ctx.body = new ErrorModel({
        data,
        msg: "用户不存在",
        code: codeMap.noUser,
      });
      return;
    }
    ctx.body = new SuccessModel({ data, msg: "更新成功" });
  }

  async delete(ctx) {
    ctx.verifyParams({
      id: { type: "string", required: true },
    });
    const data = await User.findByIdAndRemove(ctx.params.id);
    if (!data) {
      ctx.body = new ErrorModel({
        data,
        msg: "用户不存在",
        code: codeMap.noUser,
      });
      return;
    }
    ctx.body = new SuccessModel({ data, msg: "删除成功", code: 204 });
  }

  async login(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      password: { type: "string", required: true },
    });
    const user = await User.findOne(ctx.request.body);
    if (!user) {
      ctx.body = new ErrorModel({
        msg: "用户名或密码不正确",
        code: codeMap.unCorrect,
      });
      return;
    }
    const { _id, name } = user;
    const token = jwt.sign({ _id, name }, secret, {
      expiresIn: "2d",
    });
    ctx.body = new SuccessModel({
      data: { token },
      msg: "登录成功",
      code: 200,
    });
  }
}

module.exports = new UsersCtl();
