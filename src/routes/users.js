const jwt = require("koa-jwt");
const { secret } = require("../../config");
const topic = require("../controllers/topic");
const router = require("koa-router")();
const users = require("../controllers/users");
const answer = require("../controllers/answer");
const { SuccessModel, ErrorModel } = require("../models/resModel");

const auth = jwt({
  secret,
});

const authSelf = async (ctx, next) => {
  const { authorization = "" } = ctx.request.header;
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

router.get("/:id/following", users.checkUserExist, users.listFollowing);

router.get("/:id/followers", users.checkUserExist, users.listFollowers);

router.put("/following/:id", auth, users.checkUserExist, users.follow);

router.delete("/following/:id", auth, users.checkUserExist, users.unfollow);

router.put("/following-topics/:id", auth, topic.checkTopicExist, users.followTopic);

router.delete("/following-topics/:id", auth, topic.checkTopicExist, users.unfollowTopic);

router.get("/:id/following-topics", users.checkUserExist, users.listFollowingTopics);

router.get("/:id/questions", users.listQuestions);

router.get("/:id/liking-answer", users.listLikingAnswers);

router.put("/liking-answer/:id", auth, answer.checkAnswerExist, users.likeAnswer, users.undislikeAnswer);

router.delete("/liking-answer/:id", auth, answer.checkAnswerExist, users.unlikeAnswer);

router.get("/:id/disliking-answer", users.listDislikingAnswers);

router.put("/disliking-answer/:id", auth, answer.checkAnswerExist, users.dislikeAnswer, users.unlikeAnswer);

router.delete("/disliking-answer/:id", auth, answer.checkAnswerExist, users.undislikeAnswer);

router.get("/:id/collect-answer", users.listCollectingAnswers);

router.put("/collect-answer/:id", auth, answer.checkAnswerExist, users.collectAnswer);

router.delete("/collect-answer/:id", auth, answer.checkAnswerExist, users.uncollectAnswer);

module.exports = router;
