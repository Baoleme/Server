const categoryModel = require('../model/category');
const assert = require('../../lib/assert');

exports.createCategory = async (restaurant_id, name) => {
  const { insertId } = await categoryModel.createCategory(restaurant_id, name);
  return {
    category_id: insertId,
    name
  };
};

exports.updateCategoryOrder = async (restaurant_id, orderArray) => {
  const categories = (await categoryModel.getAll(restaurant_id)).map(value => value.category_id);
  assert(categories.length === orderArray.length, 'category数量不一致');
  assert(orderArray.every(id => categories.includes(id)), '只能修改自己的分类');
  await categoryModel.updateCategoryOrder(orderArray);
};

exports.updateCategory = async (id, name) => {
  assert(await exports.exist(id), '分类不存在');
  await categoryModel.updateCategory(id, name);
};

exports.deleteCategory = async id => {
  assert(await exports.exist(id), '分类不存在');
  await categoryModel.deleteCategory(id);
};

exports.dumpTo = async (from, to) => {
  assert(await exports.exist(from), '分类不存在');
  assert(await exports.exist(to), 'dump目标分类不存在');
  await categoryModel.dumpTo(from, to);
};

exports.exist = async id => {
  return Boolean(await categoryModel.getOne(id));
};

exports.getOne = async id => {
  return categoryModel.getOne(id);
};

exports.getAll = async restaurant_id => {
  return categoryModel.getAll(restaurant_id);
};
