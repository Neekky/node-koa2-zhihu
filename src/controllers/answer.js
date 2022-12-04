const Answer = require("../models/answers");

const { SuccessModel, ErrorModel } = require("../models/resModel");

const codeMap = {
  noUser: 100010, // 用户不存在
  conflict: 100409, // 冲突
  unCorrect: 100401, // 数据错误
};

class AnswerCtl {
  async find(ctx) {
    const { per_page = 10, q } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
    const regQ = new RegExp(q);
    const data = await Answer.find({
      content: regQ,
      questionId: ctx.params.questionId
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
    const data = await Answer.findById(ctx.params.id)
      .select(selects)
      .populate("answerer");
    if (!data) {
      ctx.body = new ErrorModel({
        data,
        msg: "答案不存在",
        code: codeMap.noUser,
      });
      return;
    }
    ctx.body = new SuccessModel({ data, msg: "查找答案成功" });
  }

  async create(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: true },
    });
    const answer = await new Answer({
      ...ctx.request.body,
      answerer: ctx.state.user._id,
      questionId: ctx.params.questionId
    }).save();
    ctx.body = new SuccessModel({ data: answer, msg: "回答成功" });
  }

  async update(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: false },
    });
    await ctx.state.answer.update(ctx.request.body);
    ctx.body = new SuccessModel({
      data: ctx.state.answer,
      msg: "更新回答成功",
    });
  }

  async checkAnswerExist(ctx, next) {
    const answerItem = await Answer.findById(ctx.params.id).select("+answerer");
    if (!answerItem) {
      ctx.body = new ErrorModel({
        msg: "该答案不存在",
        code: 10020404,
      });
      return;
    }
    // 只有删改查答案时进行校验，赞踩答案不校验
    if (ctx.params.questionId && answerItem.questionId !== ctx.params.questionId) {
      ctx.body = new ErrorModel({
        msg: "该问题下没有此答案",
        code: 10020404,
      });
      return;
    }
    ctx.state.answer = answerItem;
    await next();
  }

  async checkAnswerer(ctx, next) {
    if (ctx.state.answer.answerer.toString() !== ctx.state.user._id) {
      ctx.body = new ErrorModel({
        msg: "该用户没有权限",
        code: 10020403,
      });
      return;
    }
    await next();
  }

  async delete(ctx) {
    await Answer.findByIdAndRemove(ctx.params.id);
    ctx.body = new SuccessModel({
      msg: "删除成功",
      code: 204,
    });
  }
}

module.exports = new AnswerCtl();
