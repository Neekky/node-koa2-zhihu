const Comment = require("../models/comment");

const { SuccessModel, ErrorModel } = require("../models/resModel");

const codeMap = {
  noUser: 100010, // 用户不存在
  conflict: 100409, // 冲突
  unCorrect: 100401, // 数据错误
};

class CommentCtl {
  async find(ctx) {
    const { per_page = 10, q } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
    const regQ = new RegExp(q);
    const { questionId, answerId } = ctx.params;

    const { rootCommentId } = ctx.query;

    const data = await Comment.find({
      content: regQ,
      questionId,
      answerId,
      // rootCommentId,
    })
      .limit(perPage)
      .skip(page * perPage)
      .populate("commentator replyTo");
    ctx.body = new SuccessModel({ data });
  }

  async findById(ctx) {
    const { fields = "" } = ctx.query;
    const selects = fields
      .split(";")
      .filter((f) => f)
      .map((f) => " +" + f)
      .join("");
    const data = await Comment.findById(ctx.params.id)
      .select(selects)
      .populate("commentator");
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
      rootCommentId: { type: "string", required: false },
      replyTo: { type: "string", required: false },
    });
    const { questionId, answerId } = ctx.params;
    const comment = await new Comment({
      ...ctx.request.body,
      commentator: ctx.state.user._id,
      questionId,
      answerId,
    }).save();
    ctx.body = new SuccessModel({ data: comment, msg: "评论成功" });
  }

  async update(ctx) {
    ctx.verifyParams({
      content: { type: "string", required: false },
    });
    const { content } = ctx.request.body;
    await ctx.state.comment.update({ content });
    ctx.body = new SuccessModel({
      data: ctx.state.comment,
      msg: "更新评论成功",
    });
  }

  async checkCommentExist(ctx, next) {
    const commentItem = await Comment.findById(ctx.params.id).select(
      "+commentator"
    );
    if (!commentItem) {
      ctx.body = new ErrorModel({
        msg: "该评论不存在",
        code: 1002401,
      });
      return;
    }
    // 只有删改查答案时进行校验，赞踩答案不校验
    if (
      ctx.params.questionId &&
      commentItem.questionId !== ctx.params.questionId
    ) {
      ctx.body = new ErrorModel({
        msg: "该问题下没有此评论",
        code: 10020404,
      });
      return;
    }
    if (ctx.params.answerId && commentItem.answerId !== ctx.params.answerId) {
      ctx.body = new ErrorModel({
        msg: "该答案下没有此评论",
        code: 10020408,
      });
      return;
    }
    ctx.state.comment = commentItem;
    await next();
  }

  async checkCommentator(ctx, next) {
    if (ctx.state.comment.commentator.toString() !== ctx.state.user._id) {
      ctx.body = new ErrorModel({
        msg: "该用户没有权限",
        code: 10020403,
      });
      return;
    }
    await next();
  }

  async delete(ctx) {
    await Comment.findByIdAndRemove(ctx.params.id);
    ctx.body = new SuccessModel({
      msg: "删除成功",
      code: 204,
    });
  }
}

module.exports = new CommentCtl();
