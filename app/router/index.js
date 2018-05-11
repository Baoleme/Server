const Router = require('koa-router');
const router = new Router();

router.use(require('./restaurantAccount').routes());
router.use(require('./customerAccount').routes());
router.use(require('./table').routes());

module.exports = router.routes();
