const Question = require("../models/question");
const User = require("../models/users");

const { SuccessModel, ErrorModel } = require("../models/resModel");

const codeMap = {
  noUser: 100010, // 用户不存在
  conflict: 100409, // 冲突
  unCorrect: 100401, // 数据错误
};

class QuestionCtl {
  async find(ctx) {
    const { per_page = 10, q, topic_id } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
    const regQ = new RegExp(q);
    const topic = topic_id ? { topics: topic_id } : {};
    const data = await Question.find({
      $or: [{ title: regQ }, { description: regQ }],
      ...topic,
    })
      .select("+questioner")
      .populate("questioner")
      .limit(perPage)
      .skip(page * perPage);
    // 联表查询测试
    //   const test = await Question.aggregate([
    //     {
    //        $lookup:
    //        {
    //           from: "Answer",
    //           localField: "_id",
    //           foreignField: "questionId",
    //           as: "answers"
    //        }
    //     },
    //     {
    //        $addFields:
    //        {
    //           first_answer:
    //           {
    //              $arrayElemAt: ["$answers", 0]
    //           }
    //        }
    //     }
    //  ])
    ctx.body = new SuccessModel({ data });
    
  }

  async findById(ctx) {
    const { fields = "" } = ctx.query;
    const selects = fields
      .split(";")
      .filter((f) => f)
      .map((f) => " +" + f)
      .join("");
    const data = await Question.findById(ctx.params.id)
      .select(selects)
      .populate("questioner topics");
    if (!data) {
      ctx.body = new ErrorModel({
        data,
        msg: "问题不存在",
        code: codeMap.noUser,
      });
      return;
    }
    ctx.body = new SuccessModel({ data, msg: "查找成功" });
  }

  async create(ctx) {
    ctx.verifyParams({
      title: { type: "string", required: true },
      description: { type: "string", required: false },
    });
    const question = await new Question({
      ...ctx.request.body,
      questioner: ctx.state.user._id,
    }).save();
    ctx.body = new SuccessModel({ data: question, msg: "创建话题成功" });
  }

  async update(ctx) {
    ctx.verifyParams({
      title: { type: "string", required: false },
      description: { type: "string", required: false },
    });
    await ctx.state.question.update(ctx.request.body);
    ctx.body = new SuccessModel({
      data: ctx.state.question,
      msg: "更新问题成功",
    });
  }

  async checkQuestionExist(ctx, next) {
    const questionItem = await Question.findById(ctx.params.id).select(
      "+questioner"
    );
    if (!questionItem) {
      ctx.body = new ErrorModel({
        msg: "该问题不存在",
        code: 10020404,
      });
      return;
    }
    ctx.state.question = questionItem;
    await next();
  }

  async checkQuestioner(ctx, next) {
    if (ctx.state.question.questioner.toString() !== ctx.state.user._id) {
      ctx.body = new ErrorModel({
        msg: "该用户没有权限",
        code: 10020403,
      });
      return;
    }
    await next();
  }

  async delete(ctx) {
    await Question.findByIdAndRemove(ctx.params.id);
    ctx.body = new SuccessModel({
      msg: "删除成功",
      code: 204,
    });
  }
}

module.exports = new QuestionCtl();
