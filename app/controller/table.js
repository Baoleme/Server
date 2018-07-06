const tableService = require('../service/table');

exports.getSelfTable = async ctx => {
  ctx.body = await tableService.getAllQrcode(ctx.session.restaurant_id);
};

exports.createTable = async ctx => {
  const array = ctx.request.body;
  ctx.verify({ data: array, type: 'string-array', message: '数组格式不正确' });
  const links = await tableService.createTable(ctx.session.restaurant_id, array);
  ctx.body = links;
};

exports.deleteTable = async ctx => {
  const array = ctx.request.body;
  ctx.verify({ data: array, type: 'string-array', message: '数组格式不正确' });
  await tableService.deleteTable(ctx.session.restaurant_id, array);
  ctx.status = 200;
};
