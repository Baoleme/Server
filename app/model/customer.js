const { query } = require('../../lib/db');

exports.create = customer => {
  const sql = `
    INSERT INTO Customer
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
    FROM Customer
    WHERE ?? = ?
  `;
  return (await query(sql, [field, value]))[0];
}

exports.getById = async customer_id => {
  return getByField('customer_id', customer_id);
};

exports.getByOpenid = async openid => {
  return getByField('openid', openid);
};
