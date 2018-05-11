const categoryModel = require('../model/category');
const assert = require('../../lib/assert');

exports.createCategory = async (restaurant_id, name) => {
  await categoryModel.createCategory(restaurant_id, name);
};

exports.updateCategory = async (id, name) => {
  await categoryModel.updateCategory(id, name);
};

exports.deleteCategory = async id => {
  await categoryModel.deleteCategory(id);
};

exports.dumpTo = async (from, to) => {
  assert(await exports.exist(to), 'dump目标分类不存在');
  await categoryModel.dumpTo(from, to);
};

exports.exist = async id => {
  return Boolean(await categoryModel.getOne(id));
};
