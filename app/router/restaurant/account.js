const Router = require('koa-router');
const router = new Router();
const ctrl = require('../../controller/restaurant/account');
const authorize = require('../../../lib/authorize');

router.post('/restaurant', ctrl.create);
router.post('/restaurant/session', ctrl.login);
router.delete('/restaurant/session', ctrl.logout);
router.get('/restaurant/self', authorize.onlyRestaurant, ctrl.getSelfInformation);
router.post('/restaurant/emailConfirm', authorize.onlyRestaurant, ctrl.sendConfirmEmail);
router.get('/restaurant/emailConfirm', ctrl.emailConfirm);

module.exports = router;
