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
    const { per_page = 10, page, q } = ctx.query;
    const ppage = Math.max(page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
    const data = await User.find({
      name: new RegExp(q),
    })
      .limit(perPage)
      .skip(ppage * perPage);
    ctx.body = new SuccessModel({ data });
  }

  async findById(ctx) {
    const { fields = "" } = ctx.query;

    const selects = fields
      .split(";")
      .filter((f) => f)
      .map((f) => " +" + f)
      .join("");

    const populateStr = fields
      .split(";")
      .filter((f) => f)
      .map((f) => {
        if (f === "employments") return "employments.company employments.job"
        if (f === "educations") return "educations.school educations.major"
        return f;
      })
      .join(" ");

    const data = await User.findById(ctx.params.id)
      .select(selects)
      .populate(populateStr);

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
    console.log(ctx.params.id, ctx.state.user._id, " ctx.state.user._id is");
    if (ctx.params.id !== ctx.state.user._id) {
      ctx.body = new ErrorModel({
        msg: "该用户没有权限",
        code: 403,
        pid: ctx.params.id,
        sid: ctx.state.user._id,
      });
      return;
    }
    await next();
  }

  async update(ctx) {
    ctx.verifyParams({
      name: { type: "string", required: false },
      password: { type: "string", required: false },
      avatar_url: { type: "string", required: false },
      gender: { type: "string", required: false },
      headline: { type: "string", required: false },
      locations: { type: "array", itemType: "string", required: false },
      business: { type: "string", required: false },
      employments: { type: "array", itemType: "object", required: false },
      educations: { type: "array", itemType: "object", required: false },
      introduction: { type: "string", required: false },
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

  async listFollowing(ctx) {
    try {
      const user = await User.findById(ctx.params.id)
        .select("+following")
        .populate("following");
      if (!user) {
        ctx.body = new ErrorModel({
          msg: "没有该用户",
          code: codeMap.unCorrect,
        });
        return;
      }
      ctx.body = new SuccessModel({
        data: user.following,
        msg: "查询成功",
        code: 200,
      });
    } catch (error) {
      ctx.body = new ErrorModel({
        msg: "查询失败",
        code: codeMap.unCorrect,
      });
    }
  }

  async listFollowers(ctx) {
    const users = await User.find({ following: ctx.params.id });
    ctx.body = new SuccessModel({
      data: users,
      msg: "查询成功",
      code: 200,
    });
  }

  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id);
    if (!user) {
      ctx.body = new ErrorModel({
        msg: "用户不存在",
        code: 10020404,
      });
      return;
    }
    await next();
  }

  async follow(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+following");
    const id = ctx.params.id;
    if (!me.following.map((id) => id.toString()).includes(id)) {
      me.following.push(id);
      me.save();
      ctx.body = new SuccessModel({
        msg: "关注成功",
        code: 204,
      });
    } else {
      ctx.body = new ErrorModel({
        msg: "您已经关注该用户",
        code: codeMap.unCorrect,
      });
    }
  }

  async unfollow(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+following");
    const id = ctx.params.id;
    const index = me.following.map((id) => id.toString()).indexOf(id);
    if (index > -1) {
      me.following.splice(index, 1);
      me.save();
      ctx.body = new SuccessModel({
        msg: "取消关注成功",
        code: 204,
      });
    } else {
      ctx.body = new ErrorModel({
        msg: "您未关注该用户",
        code: codeMap.unCorrect,
      });
    }
  }

  // 获取用户关注的话题
  async listFollowingTopics(ctx) {
    try {
      const topicList = await User.findById(ctx.params.id)
        .select("+followingTopics")
        .populate("followingTopics");
      if (!topicList) {
        ctx.body = new ErrorModel({
          msg: "没有该话题",
          code: codeMap.unCorrect,
        });
        return;
      }
      ctx.body = new SuccessModel({
        data: topicList.followingTopics,
        msg: "查询成功",
        code: 200,
      });
    } catch (error) {
      ctx.body = new ErrorModel({
        msg: "查询失败",
        code: codeMap.unCorrect,
        err: error
      });
    }
  }

  async followTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+followingTopics");
    const id = ctx.params.id;
    if (!me.followingTopics.map((id) => id.toString()).includes(id)) {
      me.followingTopics.push(id);
      me.save();
      ctx.body = new SuccessModel({
        msg: "关注成功",
        code: 204,
      });
    } else {
      ctx.body = new ErrorModel({
        msg: "您已经关注该话题",
        code: codeMap.unCorrect,
      });
    }
  }

  async unfollowTopic(ctx) {
    const me = await User.findById(ctx.state.user._id).select("+followingTopics");
    const id = ctx.params.id;
    const index = me.followingTopics.map((id) => id.toString()).indexOf(id);
    if (index > -1) {
      me.followingTopics.splice(index, 1);
      me.save();
      ctx.body = new SuccessModel({
        msg: "取消关注成功",
        code: 204,
      });
    } else {
      ctx.body = new ErrorModel({
        msg: "您未关注该话题",
        code: codeMap.unCorrect,
      });
    }
  }
}

module.exports = new UsersCtl();
