const dishModel = require('../model/dish');
const categoryService = require('./category');
const assert = require('../../lib/assert');
const _ = require('lodash');

exports.getSelfDish = async restaurant_id => {
  const categories = await categoryService.getAll(restaurant_id);
  if (categories.length === 0) return [];
};

exports.createDish = async (restaurant_id, info) => {
  const category = await categoryService.getOne(info.category_id);
  assert(category, '分类不存在');
  assert(category.restaurant_id === restaurant_id, '这个分类不属于你');
  const dish = {
    restaurant_id,
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

exports.updateDish = async (restaurant_id, dish_id, info) => {
  assert(await exports.exist(dish_id), '菜品不存在');
  if (info.category_id) {
    const category = await categoryService.getOne(info.category_id);
    assert(category, '分类不存在');
    assert(category.restaurant_id === restaurant_id, '这个分类不属于你');
  }
  const dish = _.pick(info, ['category_id', 'name', 'price']);
  const otherFields = _.mapValues(_.pick(info, ['specifications', 'image_urls', 'description', 'tag']), JSON.stringify);
  Object.assign(dish, otherFields);
  await dishModel.updateDish(dish_id, dish);
};

exports.deleteDish = async (restaurant_id, id) => {
  const dish = await dishModel.getOne(id);
  if (!dish) return;
  assert(dish.restaurant_id === restaurant_id, '这个菜品不属于你');
  await dishModel.deleteDish(id);
};

exports.exist = async id => {
  return Boolean(await dishModel.getOne(id));
};

exports.getOne = async id => {
  return dishModel.getOne(id);
};
