const categoryService = require('../service/category');

exports.createCategory = async ctx => {
  const { name } = ctx.request.body;
  ctx.verify({ data: name, type: 'string', maxLength: 45, message: 'name格式不正确' });
  await categoryService.createCategory(ctx.session.restaurant_id, name);
  ctx.status = 200;
};

exports.updateCategory = async ctx => {
  const { name } = ctx.request.body;
  const id = Number(ctx.params.id);
  ctx.verify(
    { data: name, type: 'string', maxLength: 45, message: 'name格式不正确' },
    { data: id, type: 'positive', message: 'id格式不正确' }
  );
  await categoryService.updateCategory(id, name);
  ctx.status = 200;
};

exports.deleteCategory = async ctx => {
  const id = Number(ctx.params.id);
  ctx.verify({ data: id, type: 'positive', message: 'id格式不正确' });
  const dumpDesId = Number(ctx.query.dump);
  if (dumpDesId) {
    ctx.verify({ data: Number(dumpDesId), type: 'positive', message: 'dump格式不正确' });
    await categoryService.dumpTo(id, dumpDesId);
  }
  await categoryService.deleteCategory(id);
  ctx.status = 200;
};
