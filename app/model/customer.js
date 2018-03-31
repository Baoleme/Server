const { query } = require('../../lib/db');

exports.create = customer => {
  const sql = `
    INSERT INTO customer
    (openid)
    VALUES
    (?)
  `;
  return query(sql, [customer.openid]);
};

async function getByField (field, value) {
  const sql = `
    SELECT
    customer_id,
    openid
    FROM customer
    WHERE ${field} = ?
  `;
  return (await query(sql, [value]))[0];
}

exports.getById = async customer_id => {
  return getByField('customer_id', customer_id);
};

exports.getByOpenid = async openid => {
  return getByField('openid', openid);
};
