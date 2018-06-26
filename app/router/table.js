const Router = require('koa-router');
const router = new Router();
const ctrl = require('../controller/table');
const { onlyRestaurant } = require('../../lib/authorize');

router.get('/qrcode', onlyRestaurant, ctrl.getSelfTable);
router.post('/qrcode', onlyRestaurant, ctrl.createTable);
router.delete('/qrcode', onlyRestaurant, ctrl.deleteTable);

module.exports = router;
