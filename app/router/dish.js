const Router = require('koa-router');
const router = new Router();
const ctrl = require('../controller/dish');
const { onlyRestaurant, onlyCustomer } = require('../../lib/authorize');

router.get('/dish', onlyRestaurant, ctrl.getSelfDish);
router.post('/dish', onlyRestaurant, ctrl.createDish);
router.put('/dish/:id', onlyRestaurant, ctrl.updateDish);
router.delete('/dish/:id', onlyRestaurant, ctrl.deleteDish);
router.get('/restaurant/:id', onlyCustomer, ctrl.getInfoAndDish);

module.exports = router;
