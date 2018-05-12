const { query } = require('../../lib/db');
const _ = require('lodash');

exports.ORDER_STATE = {
  CREATED: 'created',
  PAID: 'paid',
  ACCEPTED: 'accepted',
  CANCELLED: 'canelled',
  COMPLETED: 'completed'
};

exports.createOrder = async order => {
  const sql = `
    INSERT INTO \`Order\`
    (customer_id, restaurant_id, price, \`table\`, dish, remark)
    VALUES
    (?, ?, ?, ?, ?, ?)
  `;
  return query(sql, [order.customer_id, order.restaurant_id, order.price, order.table, order.dish, order.remark]);
};

exports.updateOrder = (id, order) => {
  const sql = `
    UPDATE \`Order\`
    SET
    ?? = ?
    ${', ?? = ?'.repeat(_.keys(order).length - 1)}
    WHERE order_id = ?
  `;
  const data = _(order).toPairs().flatten().value();
  data.push(id);
  return query(sql, data);
};

exports.updateState = async (order_id, state) => {
  const sql = `
    INSERT INTO OrderRecord
    (order_id, state)
    VALUES
    (?, ?)
  `;
  return query(sql, [order_id, state]);
};

exports.getState = async (order_id, limit) => {
  const sql = `
    SELECT
    order_record_id,
    order_id,
    state,
    time
    FROM OrderRecord
    WHERE order_id = ?
    ORDER BY time DESC
    ${limit ? 'LIMIT ' + limit : ''}
  `;
  return query(sql, [order_id]);
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
    FROM \`Order\`
    WHERE order_id = ?
  `;
  const arr = await query(sql, [id]);
  return arr.length ? arr[0] : null;
};
