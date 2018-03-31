const Router = require('koa-router');
const router = new Router();
const ctrl = require('../../controller/customer/account');

router.get('/restaurant/self', ctrl.getSelfInformation);
router.post('/restaurant/session', ctrl.login);
router.delete('/restaurant/session', ctrl.logout);

module.exports = ctrl;
