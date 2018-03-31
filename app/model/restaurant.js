const { query } = require('../../lib/db');

exports.create = restaurant => {
  const sql = `
    INSERT INTO restaurant
    (email, name, password)
    VALUES
    (?, ?, ?)
  `;
  return query(sql, [restaurant.email, restaurant.name, restaurant.password]);
};

exports.getById = async restaurant_id => {
  const sql = `
    SELECT
    restaurant_id,
    email,
    confirm_email,
    name
    FROM restaurant
    WHERE restaurant_id = ?
  `;
  return (await query(sql, [restaurant_id]))[0];
};

exports.getIdAndiePasswordByEmail = async email => {
  const sql = `
    SELECT
    password,
    id
    FROM restaurant
    WHERE email = ?
  `;
  return (await query(sql, [email]))[0];
};
