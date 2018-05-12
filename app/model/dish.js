const { query } = require('../../lib/db');
const _ = require('lodash');

exports.createDish = dish => {
  const sql = `
    INSERT INTO Dish
    (category_id, name, price, specifications, image_urls, description, tag)
    VALUES
    (?, ?, ?, ?, ?, ?, ?)
  `;
  return query(sql, [dish.category_id, dish.name, dish.price, dish.specifications, dish.image_urls, dish.description, dish.tag]);
};

exports.updateDish = (id, dish) => {
  const sql = `
    UPDATE Dish
    SET
    ?? = ?
    ${', ?? = ?'.repeat(_.keys(dish).length - 1)}
    WHERE dish_id = ?
  `;
  const data = _(dish).toPairs().flatten().value();
  data.push(id);
  return query(sql, data);
};

exports.deleteDish = id => {
  const sql = `
    DELETE FROM Dish
    WHERE dish_id = ?
  `;
  return query(sql, [id]);
};

exports.getOne = async id => {
  const sql = `
    SELECT
    dish_id,
    category_id,
    name,
    price,
    specifications,
    image_urls,
    description,
    tag
    FROM Dish
    WHERE dish_id = ?
  `;
  const arr = await query(sql, [id]);
  return arr.length ? arr[0] : null;
};
