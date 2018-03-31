const restaurantModel = require('../model/restaurant');
const assert = require('../../lib/assert');

exports.create = restaurant => {
  return restaurantModel.create(restaurant);
};

exports.login = async (email, password) => {
  const restaurant = await restaurantModel.getPasswordByEmail(email);
  assert(password === restaurant.password, '用户名或密码错误');
  return restaurantModel.getById(restaurant.restaurant_id);
};
