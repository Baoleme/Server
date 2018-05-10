const Router = require('koa-router');
const router = new Router();
const ctrl = require('../controller/customerAccount');
const authorize = require('../../lib/authorize');

router.get('/customer/self', authorize.onlyCustomer, ctrl.getSelfInformation);
router.post('/customer/session', ctrl.login);
router.delete('/customer/session', ctrl.logout);

module.exports = router;
