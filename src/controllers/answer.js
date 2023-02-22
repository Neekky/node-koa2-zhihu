const Answer = require("../models/answers");
const Question = require("../models/question");

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
      questionId: ctx.params.questionId,
    })
      .populate("answerer liked_by")
      .limit(perPage)
      .skip(page * perPage);
    ctx.body = new SuccessModel({ data });
  }

  async findplus(ctx) {
    const { per_page = 10, q, userId } = ctx.query;
    const { questionId } = ctx.params;
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
    const skip = page * perPage || 0;
    const regQ = new RegExp(q);
    console.log(userId, "useris")
    const data = await Answer.aggregate([
      { $match: { questionId } }, // 查询指定问题的所有答案
      // {
      //   $lookup: {
      //     // 将答案中的liked_by数组中的用户ID与用户集合进行联接
      //     from: "User",
      //     let: { likedBy: "$liked_by_new" },
      //     pipeline: [
      //       { $match: { $expr: { $in: ["$_id", "$$likedBy"] } } },
      //       { $project: { _id: 1 } },
      //     ],
      //     as: "likedByCurrentUser",
      //   },
      // },
      // 添加likedByCurrentUser字段，标记当前用户是否已点赞
      {
        $addFields: {
          // likedByCurrentUser: 1,
          // isLiked: 2, // 在liked_by数组中查找userId是否存在，返回boolean值
          // likedByCurrentUser: { $gt: [{ $size: "$likedByCurrentUser" }, 0] },
        },
      },
      { $sort: { created_at: -1 } }, // 按创建时间逆序排序
      {
        $facet: {
          // 将结果分为两个阶段：答案列表和分页信息
          answers: [
            { $skip: skip }, // 跳过前10个文档
            { $limit: perPage }, // 返回10个文档
            {
              $project: {
                // 选择需要返回的字段
                _id: 1,
                content: 1,
                answerer: 1,
                voteCount: 1,
                // likedByCurrentUser: 1,
                liked_by: { $in: [userId] } // 在liked_by数组中查找userId是否存在，返回boolean值
              },
            },
          ],
          pageInfo: [
            // 计算分页信息
            {
              $group: {
                // 使用$group管道阶段计算总文档数
                _id: null,
                total: { $sum: 1 },
              },
            },
            {
              $addFields: {
                // 增加一个字段，计算总页数
                totalPages: { $ceil: { $divide: ["$total", perPage] } }, // 假设每页返回10个文档
              },
            },
            {
              $project: {
                // 选择需要返回的字段
                total: 1,
                totalPages: 1,
                currentPage: 2, // 假设当前页数为2
              },
            },
          ],
        },
      },
    ]);
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
    const quesData = await Question.findById(ctx.params.questionId);

    // 先校验问题是否存在
    if (!quesData) {
      ctx.body = new ErrorModel({
        data: quesData,
        msg: "问题不存在",
        code: codeMap.unCorrect,
      });
      return;
    }
    const answer = await new Answer({
      ...ctx.request.body,
      answerer: ctx.state.user._id,
      questionId: ctx.params.questionId,
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
    if (
      ctx.params.questionId &&
      answerItem.questionId !== ctx.params.questionId
    ) {
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
