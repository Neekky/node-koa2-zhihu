const router = require('koa-router')()
const users = require("../controllers/users");

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.post('/create', users.create)

router.get('/find', users.find)

router.get('/findById/:id', users.findById)

router.put('/update/:id', users.update)

router.delete('/delete/:id', users.delete)

module.exports = router
