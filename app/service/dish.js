const dishModel = require('../model/dish');
const categoryService = require('./category');
const assert = require('../../lib/assert');
const _ = require('lodash');

exports.getSelfDish = async ctx => {

};

exports.createDish = async info => {
  assert(await categoryService.exist(info.category_id), '分类不存在');
  const dish = {
    category_id: info.category_id,
    name: info.name,
    price: info.price
  };
  dish.specifications = info.specifications ? JSON.stringify(info.specifications) : '[]';
  dish.image_urls = info.image_urls ? JSON.stringify(info.image_urls) : '[]';
  dish.description = info.description || '';
  dish.tag = info.tag ? JSON.stringify(info.tag) : '[]';
  await dishModel.createDish(dish);
};

exports.updateDish = async (id, info) => {
  assert(await exports.exist(id), '菜品不存在');
  if (info.category_id) assert(await categoryService.exist(info.category_id), '分类不存在');
  const dish = _.pick(info, ['category_id', 'name', 'price']);
  const otherFields = _.mapValues(_.pick(info, ['specifications', 'image_urls', 'description', 'tag']), JSON.stringify);
  Object.assign(dish, otherFields);
  await dishModel.updateDish(id, dish);
};

exports.deleteDish = async id => {
  await dishModel.deleteDish(id);
};

exports.exist = async id => {
  return Boolean(await dishModel.getOne(id));
};
