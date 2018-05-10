const Router = require('koa-router');
const router = new Router();

router.use(require('./restaurant/account').routes());
router.use(require('./customer/account').routes());

module.exports = router.routes();
