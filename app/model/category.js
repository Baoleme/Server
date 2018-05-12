const { query } = require('../../lib/db');

exports.createCategory = async (id, name) => {
  const sql = `
    INSERT INTO Category
    (restaurant_id, name)
    VALUES
    (?, ?)
  `;
  return query(sql, [id, name]);
};

exports.updateCategory = async (id, name) => {
  const sql = `
    UPDATE Category
    SET name = ?
    WHERE category_id = ?
  `;
  return query(sql, [name, id]);
};

exports.deleteCategory = async id => {
  const sql = `
    DELETE FROM Category
    WHERE category_id = ?
  `;
  return query(sql, [id]);
};

exports.dumpTo = async (from, to) => {
  const sql = `
    UPDATE Dish
    SET category_id = ?
    WHERE category_id = ?
  `;
  return query(sql, [to, from]);
};

exports.getOne = async id => {
  const sql = `
    SELECT
    category_id,
    restaurant_id,
    name
    FROM Category
    WHERE category_id = ?
  `;
  const arr = await query(sql, [id]);
  return arr.length ? arr[0] : null;
};

exports.getAll = async restaurant_id => {
  const sql = `
    SELECT
    category_id,
    restaurant_id,
    name
    FROM Category
    WHERE restaurant_id = ?
  `;
  return query(sql, [restaurant_id]);
};
