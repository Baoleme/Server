const { query, transaction } = require('../../lib/db');
const _ = require('lodash');

exports.ORDER_STATE = {
  CREATED: 'created',
  PAID: 'paid',
  ACCEPTED: 'accepted',
  CANCELLED: 'cancelled',
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

exports.getRestaurantOrder = async (restaurant_id, offset, limit, state, keyword) => {
  let searchSQL = '';
  let searchData = '';
  if (keyword) {
    const nan = isNaN(Number(keyword));
    searchSQL = nan ? `
        AND (
          o.dish LIKE ?
          OR o.payment LIKE ?
          OR o.remark LIKE ?
        )
        ` : `
        AND (
          o.order_id = ?
          OR o.price = ?
          OR o.\`table\` = ?
        )
        `;
    searchData = nan ? Array(3).fill(`%${keyword}%`) : Array(3).fill(keyword);
  }
  const sql = `
    SELECT
    SQL_CALC_FOUND_ROWS
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
    AND r.state IN (?${',?'.repeat(state.length - 1)})
    ${searchSQL}
    ORDER BY FIELD(r.state${',?'.repeat(state.length)})
    LIMIT ?, ?
  `;
  const data = [restaurant_id, ...state, ...searchData, ...state, offset, limit];
  let res;
  await transaction(async query => {
    res = await query(sql, data);
    res.count = (await query('SELECT FOUND_ROWS() AS count'))[0].count;
  });
  return res;
};

exports.getRestaurantOrderNumber = async (restaurant_id, state, keyword) => {
  const searchSQL = keyword ? `
    AND (
      o.order_id LIKE ?
      OR o.price LIKE ?
      OR o.\`table\` LIKE ?
      OR o.dish LIKE ?
      OR o.payment LIKE ?
      OR o.remark LIKE ?
    )
  ` : '';
  const searchData = keyword ? Array(6).fill(`%${keyword}%`) : [];
  const sql = `
    SELECT
    count(1) AS number
    FROM \`Order\` o JOIN OrderRecord r
    ON r.order_record_id = (
      SELECT
      MAX(r1.order_record_id)
      FROM OrderRecord r1
      WHERE r1.order_id = o.order_id
    )
    WHERE o.restaurant_id = ?
    AND r.state IN (?${',?'.repeat(state.length - 1)})
    ${searchSQL}
  `;
  return (await query(sql, [restaurant_id, ...state, ...searchData]))[0].number;
};

exports.getCustomerOrder = async (customer_id, since, limit) => {
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
    ORDER BY r.time DESC
    LIMIT ?
  `;
  return query(sql, [customer_id, since, limit]);
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
