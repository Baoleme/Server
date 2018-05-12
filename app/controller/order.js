const orderService = require('../service/order');
const _ = require('lodash');

exports.createOrder = async ctx => {
  const info = _.pick(ctx.request.body, ['restaurant_id', 'table', 'price', 'dish', 'remark']);
  ctx.verify(
    { data: info.restaurant_id, type: 'positive', message: 'restaurant_id格式不正确' },
    { data: info.table, type: 'string', maxLength: 45, message: 'table格式不正确' },
    { data: info.price, type: 'positive', message: 'price格式不正确' },
    { data: info.dish, type: 'array', message: 'dish格式不正确' },
    { data: info.remark, type: 'string', require: false, message: 'remark格式不正确' }
  );
  if (info.dish) {
    for (const one of info.dish) {
      ctx.verify(
        { data: one.dish_id, type: 'positive', message: 'dish.dish_id格式不正确' },
        { data: one.specifications, type: 'e-non-negative-array', message: 'dish.specifications格式不正确' }
      );
    }
  }
  const id = await orderService.createOrder(ctx.session.customer_id, info);
  ctx.body = await orderService.getCompleteInfomation(id);
};

exports.pay = async ctx => {
  const { id } = ctx.params;
  ctx.verify({ data: Number(id), type: 'positive', message: 'id格式不正确' });
  await orderService.pay(id);
  ctx.status = 200;
};

exports.getRestaurantOrder = async ctx => {

};

exports.updateOrderState = async ctx => {
  const { id } = ctx.params;
  const { state } = ctx.request.body;
  ctx.verify(
    { data: Number(id), type: 'positive', message: 'id格式不正确' },
    { data: state, type: 'string', message: 'state格式不正确' }
  );
  await orderService.updateOrderState(id, state);
  ctx.status = 200;
};
