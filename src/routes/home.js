const router = require("koa-router")();
const home = require("../controllers/home");

router.post("/upload", home.upload);

module.exports = router;
