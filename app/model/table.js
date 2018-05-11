const { query } = require('../../lib/db');

exports.getAll = restaurant_id => {
  const sql = `
    SELECT
    name
    FROM \`Table\`
    WHERE restaurant_id = ?
  `;
  return query(sql, [restaurant_id]);
};

exports.createTable = (id, array) => {
  const sql = `
    REPLACE INTO \`Table\`
    (restaurant_id, name)
    VALUES
    (?, ?)${',(?, ?)'.repeat(array.length - 1)}
  `;
  const data = [];
  for (const one of array) {
    data.push(id, one);
  }
  return query(sql, data);
};

exports.deleteTable = (id, array) => {
  const sql = `
    DELETE FROM \`Table\`
    WHERE
    (restaurant_id, name)
    IN
    ((?, ?)${',(?, ?)'.repeat(array.length - 1)})
  `;
  const data = [];
  for (const one of array) {
    data.push(id, one);
  }
  return query(sql, data);
};
