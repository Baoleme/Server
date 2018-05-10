const assert = require('./assert');

exports.onlyCustomer = (ctx, next) => {
  assert(ctx.session.customer_id, '请先登录客户账号');
  return next();
};

exports.onlyRestaurant = (ctx, next) => {
  assert(ctx.session.restaurant_id, '请先登录餐厅账号');
  return next();
};

exports.onlyLogin = (ctx, next) => {
  assert(ctx.session.customer_id || ctx.session.restaurant_id, '请先登录');
  return next();
};
