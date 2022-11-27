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

router.get("/:id", topic.findById);

router.patch("/:id", auth, topic.update);

module.exports = router;
