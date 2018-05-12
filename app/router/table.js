const Router = require('koa-router');
const router = new Router();
const ctrl = require('../controller/table');
const { onlyCustomer, onlyRestaurant } = require('../../lib/authorize');

router.get('/table', onlyRestaurant, ctrl.getSelfTable);
router.get('/restaurant/:id/table', onlyCustomer, ctrl.getRestaurantTable);
router.post('/table', onlyRestaurant, ctrl.createTable);
router.delete('/table', onlyRestaurant, ctrl.deleteTable);

module.exports = router;
