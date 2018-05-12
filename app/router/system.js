const Router = require('koa-router');
const router = new Router();
const ctrl = require('../controller/system');
const { onlyRestaurant } = require('../../lib/authorize');

router.post('/image', onlyRestaurant, ctrl.uploadImage);

module.exports = router;
