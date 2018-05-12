const dishService = require('../service/dish');
const verify = require('../../lib/verify');
const _ = require('lodash');

exports.getSelfDish = async ctx => {

};

exports.createDish = async ctx => {
  const info = _.pick(ctx.request.body, ['category_id', 'name', 'price', 'specifications', 'image_urls', 'description', 'tag']);
  ctx.verify(
    { data: info.category_id, type: 'positive-string', message: 'category_id格式不正确' },
    { data: info.name, type: 'string', maxLength: 45, message: 'name格式不正确' },
    { data: info.price, type: 'number', message: 'price格式不正确' },
    { data: info.specifications, type: 'array', require: false, message: 'specifications格式不正确' },
    { data: info.image_urls, type: 'string-array', require: false, message: 'image_urls格式不正确' },
    { data: info.description, type: 'string', require: false, message: 'description格式不正确' },
    { data: info.tag, type: 'string-array', require: false, message: 'tag格式不正确' }
  );
  if (info.specifications) checkSpecifications(info.specifications);
  await dishService.createDish(info);
  ctx.status = 200;
};

exports.updateDish = async ctx => {
  const info = _.pick(ctx.request.body, ['category_id', 'name', 'price', 'specifications', 'image_urls', 'description', 'tag']);
  const { id } = ctx.params;
  ctx.verify(
    { data: id, type: 'positive-string', message: 'id格式不正确' },
    { data: info.category_id, type: 'positive-string', require: false, message: 'category_id格式不正确' },
    { data: info.name, type: 'string', maxLength: 45, require: false, message: 'name格式不正确' },
    { data: info.price, type: 'number', require: false, message: 'price格式不正确' },
    { data: info.specifications, type: 'array', require: false, message: 'specifications格式不正确' },
    { data: info.image_urls, type: 'string-array', require: false, message: 'image_urls格式不正确' },
    { data: info.description, type: 'string', require: false, message: 'description格式不正确' },
    { data: info.tag, type: 'string-array', require: false, message: 'tag格式不正确' }
  );
  if (info.specifications) checkSpecifications(info.specifications);
  if (_.keys(info).length) await dishService.updateDish(id, info);
  ctx.status = 200;
};

exports.deleteDish = async ctx => {
  const { id } = ctx.params;
  ctx.verify({ data: id, type: 'positive-string', message: 'id格式不正确' });
  await dishService.deleteDish(id);
  ctx.status = 200;
};

function checkSpecifications (specifications) {
  for (const one of specifications) {
    verify(
      { data: one.name, type: 'string', maxLength: 45, message: 'specifications.name格式不正确' },
      { data: one.require, type: 'boolean', message: 'specifications.require格式不正确' },
      { data: one.default, type: 'non-negative', message: 'specifications.default格式不正确' },
      { data: one.options, type: 'array', message: 'specifications.options格式不正确' }
    );
    for (const option of one.options) {
      verify(
        { data: option.name, type: 'string', maxLength: 45, message: 'specifications.options.name格式不正确' },
        { data: option.delta, type: 'number', message: 'specifications.options.delta格式不正确' }
      );
    }
  }
}
