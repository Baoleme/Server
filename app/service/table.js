const tableModel = require('../model/table');
const restaurantService = require('./restaurantAccount');
const assert = require('../../lib/assert');

exports.getAll = async id => {
  assert(await restaurantService.exist(id), '餐厅不存在');
  const tables = await tableModel.getAll(id);
  return tables.map(one => one.name);
};

exports.createTable = async (id, array) => {
  assert(await restaurantService.exist(id), '餐厅不存在');
  await tableModel.createTable(id, array);
};

exports.deleteTable = async (id, array) => {
  assert(await restaurantService.exist(id), '餐厅不存在');
  await tableModel.deleteTable(id, array);
};
