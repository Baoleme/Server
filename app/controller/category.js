const categoryService = require('../service/category');

exports.createCategory = async ctx => {
  const { name } = ctx.request.body;
  ctx.verify({ data: name, type: 'string', maxLength: 45, message: 'name格式不正确' });
  ctx.body = await categoryService.createCategory(ctx.session.restaurant_id, name);
};

exports.updateCategoryOrder = async ctx => {
  const orderArray = ctx.request.body;
  ctx.verify(
    { data: orderArray, type: 'non-negative-array', message: '参数格式不正确' }
  );
  await categoryService.updateCategoryOrder(ctx.session.restaurant_id, orderArray);
  ctx.status = 200;
};

exports.updateCategory = async ctx => {
  const { name } = ctx.request.body;
  ctx.verify(
    { data: name, type: 'string', maxLength: 45, message: 'name格式不正确' },
    { data: Number(ctx.params.id), type: 'positive', message: 'id格式不正确' }
  );
  await categoryService.updateCategory(ctx.params.id, name);
  ctx.status = 200;
};

exports.deleteCategory = async ctx => {
  const id = ctx.params.id;
  let dumpDesId = ctx.query.dump;
  if (dumpDesId) dumpDesId = Number(dumpDesId);
  ctx.verify(
    { data: Number(id), type: 'positive', message: 'id格式不正确' },
    { data: dumpDesId, type: 'positive', require: false, message: 'dump格式不正确' }
  );
  if (dumpDesId) await categoryService.dumpTo(id, dumpDesId);
  await categoryService.deleteCategory(id);
  ctx.status = 200;
};
