const Router = require('koa-router');
const router = new Router();
const ctrl = require('../controller/restaurantAccount');
const { onlyRestaurant } = require('../../lib/authorize');

router.post('/restaurant', ctrl.create);
router.post('/restaurant/session', ctrl.login);
router.delete('/restaurant/session', ctrl.logout);
router.get('/restaurant/self', onlyRestaurant, ctrl.getSelfInformation);
router.put('/restaurant/self', onlyRestaurant, ctrl.updateInformation);
router.post('/restaurant/emailConfirm', onlyRestaurant, ctrl.sendConfirmEmail);
router.get('/restaurant/emailConfirm', ctrl.emailConfirm);

module.exports = router;
