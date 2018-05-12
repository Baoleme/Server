const categoryService = require('../service/category');

exports.createCategory = async ctx => {
  const { name } = ctx.request.body;
  ctx.verify({ data: name, type: 'string', maxLength: 45, message: 'name格式不正确' });
  await categoryService.createCategory(ctx.session.restaurant_id, name);
  ctx.status = 200;
};

exports.updateCategory = async ctx => {
  const { name } = ctx.request.body;
  ctx.verify(
    { data: name, type: 'string', maxLength: 45, message: 'name格式不正确' },
    { data: ctx.params.id, type: 'positive-string', message: 'id格式不正确' }
  );
  await categoryService.updateCategory(ctx.params.id, name);
  ctx.status = 200;
};

exports.deleteCategory = async ctx => {
  const id = ctx.params.id;
  const dumpDesId = ctx.query.dump;
  ctx.verify(
    { data: id, type: 'positive-string', message: 'id格式不正确' },
    { data: dumpDesId, type: 'positive-string', require: false, message: 'dump格式不正确' }
  );
  if (dumpDesId) await categoryService.dumpTo(id, dumpDesId);
  await categoryService.deleteCategory(id);
  ctx.status = 200;
};
