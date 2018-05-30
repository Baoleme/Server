const Router = require('koa-router');
const router = new Router();
const ctrl = require('../controller/category');
const { onlyRestaurant } = require('../../lib/authorize');

router.post('/category', onlyRestaurant, ctrl.createCategory);
router.put('/category', onlyRestaurant, ctrl.updateCategoryOrder);
router.put('/category/:id', onlyRestaurant, ctrl.updateCategory);
router.delete('/category/:id', onlyRestaurant, ctrl.deleteCategory);

module.exports = router;
