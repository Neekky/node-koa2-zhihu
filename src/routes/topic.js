const router = require("koa-router")();
const jwt = require("koa-jwt");
const topic = require("../controllers/topic");
const { secret } = require("../../config");

const { SuccessModel, ErrorModel } = require("../models/resModel");

const auth = jwt({
  secret,
});

router.prefix("/topics");

router.get("/", topic.find);

router.post("/", auth, topic.create);

router.get("/:id", topic.checkTopicExist, topic.findById);

router.patch("/:id", auth, topic.checkTopicExist, topic.update);

router.get("/:id/followers", topic.checkTopicExist, topic.listTopicFollowers);

router.get("/:id/questions", topic.checkTopicExist, topic.listQuestions);



module.exports = router;
