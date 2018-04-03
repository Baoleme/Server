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
  const [data] = await query(sql, [restaurant_id]);
  if (data) {
    data.confirm_email = Boolean(data.confirm_email);
  }
  return data;
};

exports.getIdAndiePasswordByEmail = async email => {
  const sql = `
    SELECT
    restaurant_id,
    password
    FROM restaurant
    WHERE email = ?
  `;
  return (await query(sql, [email]))[0];
};

exports.update = async (restaurant_id, options) => {
  let sql = 'UPDATE restaurant SET';
  const data = [];
  for (const key in options) {
    sql += ' ?? = ?,';
    data.push(key);
    data.push(options[key]);
  }
  sql = sql.substr(0, sql.length - 1);
  sql += ' WHERE restaurant_id = ?';
  data.push(restaurant_id);
  return query(sql, data);
};
