const router = require('koa-router')()

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'https://uat-hd.aihuishou.com/open-item?itemid=Q20221026348301&from=ksapp&traceid=NkZ-ao6PRD4*NkZ-ao6PRD4*KgmDO310bRk*1*W90OJVsZXGM*8*5.6.13*12*23*ext*1657248895691*serverExpTag*kpn*kpf*extType'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
