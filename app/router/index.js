const Router = require('koa-router');
const router = new Router();
const assert = require('../../lib/assert');

const allowNotLoginList = {
  get: [],
  post: [
    '/restaurant',
    '/restaurant/session',
    '/customer/session'
  ],
  put: [],
  delete: [
    '/restaurant/session',
    '/customer/session'
  ]
};

const checkLoginStatus = (ctx, next) => {
  ctx.state.passedLogincheck = true;
  return next();
};

for (const method in allowNotLoginList) {
  for (const path of allowNotLoginList[method]) {
    router[method](path, checkLoginStatus);
  }
}

router.use('/restaurant', (ctx, next) => {
  if (!ctx.state.passedLogincheck) {
    assert(ctx.session.restaurant_id, '请先登录');
  }
});

router.use('/customer', (ctx, next) => {
  if (!ctx.state.passedLogincheck) {
    assert(ctx.session.customer_id, '请先登录');
  }
});

router.use(require('./restaurant/account').routes());
router.use(require('./customer/account').routes());

module.exports = router.routes();
