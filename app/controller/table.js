const tableService = require('../service/table');

exports.getRestaurantTable = async ctx => {
  const id = Number(ctx.params.id);
  ctx.verify({ data: id, type: 'positive', message: 'id格式不正确' });
  ctx.body = await tableService.getAll(id);
};

exports.getSelfTable = async ctx => {
  ctx.body = await tableService.getAll(ctx.session.restaurant_id);
};

exports.createTable = async ctx => {
  const array = ctx.request.body;
  ctx.verify({ data: array, type: 'string-array', message: '数组格式不正确' });
  await tableService.createTable(ctx.session.restaurant_id, array);
  ctx.status = 200;
};

exports.deleteTable = async ctx => {
  const array = ctx.request.body;
  ctx.verify({ data: array, type: 'string-array', message: '数组格式不正确' });
  await tableService.deleteTable(ctx.session.restaurant_id, array);
  ctx.status = 200;
};
