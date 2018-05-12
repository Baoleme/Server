const { query } = require('../../lib/db');

exports.createOrder = async order => {
  const sql = `
    INSERT INTO \`Order\`
    (customer_id, restaurant_id, price, \`table\`, dish, remark)
    VALUES
    (?, ?, ?, ?, ?, ?)
  `;
  return query(sql, [order.customer_id, order.restaurant_id, order.price, order.table, order.dish, order.remark]);
};

exports.getOne = async id => {
  const sql = `
    SELECT
    order_id,
    customer_id,
    restaurant_id,
    price,
    \`table\`,
    payment,
    dish,
    remark
    FROM Order
    WHERE order_id = ?
  `;
  const arr = await query(sql, [id]);
  return arr.length ? arr[0] : null;
};
