const router = require("koa-router")();
const jwt = require("koa-jwt");
const question = require("../controllers/question");
const { secret } = require("../../config");

const { SuccessModel, ErrorModel } = require("../models/resModel");

const auth = jwt({
  secret,
});

router.prefix("/question");

router.get("/", question.find);

router.post("/", auth, question.create);

router.get("/:id", question.checkQuestionExist, question.findById);

router.patch("/:id", auth, question.checkQuestionExist, question.checkQuestioner, question.update);

router.delete("/:id", auth, question.checkQuestionExist, question.checkQuestioner, question.delete);

module.exports = router;
