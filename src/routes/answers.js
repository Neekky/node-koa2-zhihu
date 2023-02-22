const router = require("koa-router")();
const jwt = require("koa-jwt");
const answer = require("../controllers/answer");
const { secret } = require("../../config");

const auth = jwt({
  secret,
});

router.prefix("/question/:questionId/answer");

router.get("/", answer.find);

router.get("/plus", answer.findplus);

router.post("/", auth, answer.create);

router.get("/:id", answer.checkAnswerExist, answer.findById);

router.patch("/:id", auth, answer.checkAnswerExist, answer.checkAnswerer, answer.update);

router.delete("/:id", auth, answer.checkAnswerExist, answer.checkAnswerer, answer.delete);

module.exports = router;
