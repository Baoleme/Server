const Router = require('koa-router');
const router = new Router();
const ctrl = require('../../controller/customer/account');

router.get('/customer/self', ctrl.getSelfInformation);
router.post('/customer/session', ctrl.login);
router.delete('/customer/session', ctrl.logout);

module.exports = router;
