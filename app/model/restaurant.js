const { query } = require('../../lib/db');
const _ = require('lodash');

exports.create = restaurant => {
  const sql = `
    INSERT INTO Restaurant
    (email, name, password, license_url)
    VALUES
    (?, ?, ?, ?)
  `;
  return query(sql, [restaurant.email, restaurant.name, restaurant.password, restaurant.license_url]);
};

exports.getById = async restaurant_id => {
  const sql = `
    SELECT
    restaurant_id,
    email,
    confirm_email,
    name,
    logo_url,
    description,
    phone,
    license_url
    FROM Restaurant
    WHERE restaurant_id = ?
  `;
  const [data] = await query(sql, [restaurant_id]);
  if (data) {
    data.confirm_email = Boolean(data.confirm_email);
  }
  return data;
};

exports.getIdAndPasswordByEmail = async email => {
  const sql = `
    SELECT
    restaurant_id,
    password
    FROM Restaurant
    WHERE email = ?
  `;
  return (await query(sql, [email]))[0];
};

exports.update = async (restaurant_id, options) => {
  const sql = `
    UPDATE Restaurant
    SET
    ?? = ?
    ${', ?? = ?'.repeat(_.keys(options).length - 1)}
    WHERE restaurant_id = ?
  `;
  const data = _(options).toPairs().flatten().value();
  data.push(restaurant_id);
  return query(sql, data);
};
