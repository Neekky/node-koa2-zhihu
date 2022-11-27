const Topic = require("../models/topic");

const { SuccessModel, ErrorModel } = require("../models/resModel");

const codeMap = {
  noUser: 100010, // 用户不存在
  conflict: 100409, // 冲突
  unCorrect: 100401, // 数据错误
};

class TopicsCtl {
  async find(ctx) {
    const { per_page = 10, q } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
      const data = await Topic.find({
        name: new RegExp(q)
      })
      .limit(perPage)
      .skip(page * perPage);
    ctx.body = new SuccessModel({ data });
  }

  async findById(ctx) {
    const { fields = "" } = ctx.query;
    const selects = fields
      .split(";")
      .filter((f) => f)
      .map((f) => " +" + f)
      .join("");
    const data = await Topic.findById(ctx.params.id).select(selects);
    if (!data) {
      ctx.body = new ErrorModel({
        data,
        msg: "话题不存在",
        code: codeMap.noUser,
      });
      return;
    }
    ctx.body = new SuccessModel({ data, msg: "查找成功" });
  }

  async create(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: true },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false },
    });
    const topic = await new Topic(ctx.request.body).save();
    ctx.body = new SuccessModel({ data: topic, msg: "创建话题成功" });
  }

  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      avatar_url: { type: "string", required: false },
      introduction: { type: "string", required: false },
    });
    const topic = await Topic.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body
    );
    ctx.body = new SuccessModel({ data: topic, msg: "更新话题成功" });
  }
}

module.exports = new TopicsCtl();
