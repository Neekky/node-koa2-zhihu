const router = require("koa-router")();
const jwt = require("koa-jwt");
const comment = require("../controllers/comment");
const { secret } = require("../../config");

const auth = jwt({
  secret,
});

router.prefix("/question/:questionId/answer/:answerId/comments");

router.get("/", comment.find);

router.post("/", auth, comment.create);

router.get("/:id", comment.checkCommentExist, comment.findById);

router.patch("/:id", auth, comment.checkCommentExist, comment.checkCommentator, comment.update);

router.delete("/:id", auth, comment.checkCommentExist, comment.checkCommentator, comment.delete);

module.exports = router;
