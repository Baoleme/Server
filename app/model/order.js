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

exports.getRestaurantOrder = async (restaurant_id, since, limit) => {
  const sql = `
    SELECT
    o.order_id,
    o.customer_id,
    o.restaurant_id,
    o.price,
    o.\`table\`,
    o.payment,
    o.dish,
    o.remark,
    r.state,
    r.time
    FROM \`Order\` o JOIN OrderRecord r
    ON r.order_record_id = (
      SELECT
      MAX(r1.order_record_id)
      FROM OrderRecord r1
      WHERE r1.order_id = o.order_id
    )
    WHERE o.restaurant_id = ?
    AND r.time <= ?
    ORDER BY r.state
    LIMIT ?
  `;
  return query(sql, [restaurant_id, since, limit]);
};

exports.getCustomerOrder = async (restaurant_id, since, limit) => {
  const sql = `
    SELECT
    o.order_id,
    o.customer_id,
    o.restaurant_id,
    o.price,
    o.\`table\`,
    o.payment,
    o.dish,
    o.remark,
    r.state,
    r.time,
    res.email AS restaurant_email,
    res.confirm_email AS restaurant_confirm_email,
    res.name AS restaurant_name,
    res.logo_url AS restaurant_logo_url,
    res.description AS restaurant_description,
    res.phone AS restaurant_phone,
    res.license_url AS restaurant_license_url
    FROM \`Order\` o JOIN OrderRecord r
    ON r.order_record_id = (
      SELECT
      MAX(r1.order_record_id)
      FROM OrderRecord r1
      WHERE r1.order_id = o.order_id
    ), Restaurant res
    WHERE o.customer_id = ?
    AND r.time <= ?
    AND res.restaurant_id = o.restaurant_id
    LIMIT ?
  `;
  return query(sql, [restaurant_id, since, limit]);
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
