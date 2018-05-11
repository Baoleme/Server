const Router = require('koa-router');
const router = new Router();
const ctrl = require('../controller/category');
const { onlyRestaurant } = require('../../lib/authorize');

router.post('/restaurant/self/category', onlyRestaurant, ctrl.createCategory);
router.put('/restaurant/self/category/:id', onlyRestaurant, ctrl.updateCategory);
router.delete('/restaurant/self/category/:id', onlyRestaurant, ctrl.deleteCategory);

module.exports = router;
