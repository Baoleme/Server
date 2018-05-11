const Router = require('koa-router');
const router = new Router();
const ctrl = require('../controller/table');
const { onlyCustomer, onlyRestaurant } = require('../../lib/authorize');

router.get('/restaurant/self/table', onlyRestaurant, ctrl.getSelfTable);
router.get('/restaurant/:id/table', onlyCustomer, ctrl.getRestaurantTable);
router.post('/restaurant/self/table', onlyRestaurant, ctrl.createTable);
router.delete('/restaurant/self/table', onlyRestaurant, ctrl.deleteTable);

module.exports = router;
