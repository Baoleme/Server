const dishService = require('../service/dish');
const verify = require('../../lib/verify');
const _ = require('lodash');

exports.getSelfDish = async ctx => {
  ctx.body = await dishService.getSelfDish(ctx.session.restaurant_id);
};

exports.createDish = async ctx => {
  const info = _.pick(ctx.request.body, ['category_id', 'name', 'price', 'spicy', 'specifications', 'image_url', 'description', 'tag']);
  ctx.verify(
    { data: info.category_id, type: 'positive', message: 'category_id格式不正确' },
    { data: info.name, type: 'string', maxLength: 45, message: 'name格式不正确' },
    { data: info.price, type: 'number', message: 'price格式不正确' },
    { data: info.spicy, type: 'non-negative', require: false, message: 'spicy格式不正确' },
    { data: info.specifications, type: 'array', require: false, message: 'specifications格式不正确' },
    { data: info.image_url, type: 'string-array', require: false, message: 'image_url格式不正确' },
    { data: info.description, type: 'string', require: false, message: 'description格式不正确' },
    { data: info.tag, type: 'string-array', require: false, message: 'tag格式不正确' }
  );
  if (info.specifications) checkSpecifications(info.specifications);
  ctx.body = await dishService.createDish(ctx.session.restaurant_id, info);
};

exports.updateDish = async ctx => {
  const info = _.pick(ctx.request.body, ['category_id', 'name', 'price', 'spicy', 'specifications', 'image_url', 'description', 'tag']);
  const { id: dish_id } = ctx.params;
  ctx.verify(
    { data: Number(dish_id), type: 'positive', message: 'id格式不正确' },
    { data: info.category_id, type: 'positive', require: false, message: 'category_id格式不正确' },
    { data: info.name, type: 'string', maxLength: 45, require: false, message: 'name格式不正确' },
    { data: info.price, type: 'number', require: false, message: 'price格式不正确' },
    { data: info.spicy, type: 'non-negative', require: false, message: 'spicy格式不正确' },
    { data: info.specifications, type: 'array', require: false, message: 'specifications格式不正确' },
    { data: info.image_url, type: 'string-array', require: false, message: 'image_url格式不正确' },
    { data: info.description, type: 'string', require: false, message: 'description格式不正确' },
    { data: info.tag, type: 'string-array', require: false, message: 'tag格式不正确' }
  );
  if (info.specifications) checkSpecifications(info.specifications);
  if (_.keys(info).length) await dishService.updateDish(ctx.session.restaurant_id, dish_id, info);
  ctx.status = 200;
};

exports.deleteDish = async ctx => {
  const { id: dish_id } = ctx.params;
  ctx.verify({ data: Number(dish_id), type: 'positive', message: 'id格式不正确' });
  await dishService.deleteDish(ctx.session.restaurant_id, dish_id);
  ctx.status = 200;
};

exports.getInfoAndDish = async ctx => {
  const id = ctx.params.id;
  ctx.verify({ data: Number(id), type: 'positive', message: 'id格式不正确' });
  ctx.body = await dishService.getInfoAndDish(id);
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
