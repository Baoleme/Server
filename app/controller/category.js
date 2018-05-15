const categoryService = require('../service/category');

exports.createCategory = async ctx => {
  const { name } = ctx.request.body;
  ctx.verify({ data: name, type: 'string', maxLength: 45, message: 'name格式不正确' });
  ctx.body = await categoryService.createCategory(ctx.session.restaurant_id, name);
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
  const dumpDesId = ctx.query.dump;
  ctx.verify(
    { data: Number(id), type: 'positive', message: 'id格式不正确' },
    { data: Number(dumpDesId), type: 'positive', require: false, message: 'dump格式不正确' }
  );
  if (dumpDesId) await categoryService.dumpTo(id, dumpDesId);
  await categoryService.deleteCategory(id);
  ctx.status = 200;
};
