const User = require("../models/users");
const { SuccessModel, ErrorModel } = require("../models/resModel");

const codeMap = {
    noUser: 100010 // 用户不存在
}

class UsersCtl {
  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
    });
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
      ctx.body = new ErrorModel({ data, msg: "用户不存在", code: codeMap.noUser });
      return;
    }
    ctx.body = new SuccessModel({ data, msg: "查找成功"});
  }

  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
    });
    const data = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
    if (!data) {
      ctx.body = new ErrorModel({ data, msg: "用户不存在", code: codeMap.noUser });
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
      ctx.body = new ErrorModel({ data, msg: "用户不存在", code: codeMap.noUser });
      return;
    }
    ctx.body = new SuccessModel({ data, msg: "删除成功", code: 204 });
  }
}

module.exports = new UsersCtl();
