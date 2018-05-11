const tableModel = require('../model/table');

exports.getAll = async id => {
  const tables = await tableModel.getAll(id);
  return tables.map(one => one.name);
};

exports.createTable = async (id, array) => {
  await tableModel.createTable(id, array);
};

exports.deleteTable = async (id, array) => {
  await tableModel.deleteTable(id, array);
};
