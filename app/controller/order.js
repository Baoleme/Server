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
        { data: one.specifications, type: 'e-non-negative-array', message: 'dish.specifications格式不正确' },
        { data: one.count, type: 'positive', message: 'dish.count格式不正确' }
      );
      ctx.assert(_.keys(one).length === 3, 'dish中有多余字段');
    }
  }
  const id = await orderService.createOrder(ctx.session.customer_id, info);
  ctx.body = await orderService.getCompleteInfomation(id);
};

exports.getCustomerOrder = async ctx => {
  let { page, number } = ctx.query;
  page = page ? Number(page) : 0;
  number = number ? Number(number) : 30;
  ctx.verify(
    { data: page, type: 'non-negative', message: 'page格式不正确' },
    { data: number, type: 'positive', message: 'number格式不正确' }
  );
  ctx.body = await orderService.getCustomerOrder(ctx.session.customer_id, page, number);
};

exports.pay = async ctx => {
  const { id } = ctx.params;
  ctx.verify({ data: Number(id), type: 'positive', message: 'id格式不正确' });
  await orderService.pay(ctx.session.customer_id, id);
  ctx.status = 200;
};

exports.getRestaurantOrder = async ctx => {
  let { page, number, state, keyword } = ctx.query;
  page = page ? Number(page) : 0;
  number = number ? Number(number) : 30;
  ctx.verify(
    { data: page, type: 'non-negative', message: 'page格式不正确' },
    { data: number, type: 'positive', message: 'number格式不正确' },
    { data: state, type: 'string', require: false, message: 'state格式不正确' },
    { data: keyword, type: 'string', require: false, message: 'keyword格式不正确' }
  );
  state = state ? state.split(',') : ['paid', 'accepted', 'cancelled', 'completed', 'created'];
  ctx.body = await orderService.getRestaurantOrder(ctx.session.restaurant_id, page, number, state, keyword);
};

exports.getRestaurantOrderCount = async ctx => {
  let { from, to } = ctx.query;
  if (!from && !to) {
    from = new Date(0);
    to = new Date();
  } else {
    ctx.verify(
      { data: from, type: 'date', message: 'from格式不正确' },
      { data: to, type: 'date', message: 'to格式不正确' }
    );
  }
  ctx.body = await orderService.getRestaurantOrderCount(ctx.session.restaurant_id, from, to);
};

exports.updateOrderState = async ctx => {
  const { id } = ctx.params;
  const { state } = ctx.request.body;
  ctx.verify(
    { data: Number(id), type: 'positive', message: 'id格式不正确' },
    { data: state, type: 'string', message: 'state格式不正确' }
  );
  await orderService.updateOrderState(ctx.session.restaurant_id, id, state);
  ctx.status = 200;
};
